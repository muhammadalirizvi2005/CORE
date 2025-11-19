import { supabase } from './supabase';

interface CanvasCourse {
  id: number;
  name: string;
  course_code: string;
  enrollments: Array<{
    computed_current_score?: number;
    computed_final_score?: number;
    type: string;
  }>;
}

interface CanvasAssignment {
  id: number;
  name: string;
  points_possible: number;
  submission?: {
    score?: number;
    grade?: string;
    submitted_at?: string;
  };
  due_at?: string;
}

export interface CanvasGrade {
  courseId: string;
  courseName: string;
  courseCode: string;
  currentGrade: number;
  assignments: Array<{
    id: string;
    name: string;
    score: number;
    maxScore: number;
    dueDate?: string;
    submittedAt?: string;
  }>;
}

export const canvasService = {
  /**
   * Get Canvas access token from user's oauth_tokens table
   */
  async getCanvasToken(userId: string): Promise<string | null> {
    const { data, error } = await supabase
      .from('oauth_tokens')
      .select('access_token')
      .eq('user_id', userId)
      .eq('provider', 'canvas')
      .single();

    if (error || !data) {
      console.log('No Canvas token found for user');
      return null;
    }

    return data.access_token;
  },

  /**
   * Get Canvas base URL from localStorage or user settings
   */
  getCanvasBaseUrl(): string | null {
    return localStorage.getItem('canvasBaseUrl');
  },

  /**
   * Fetch all courses with grades from Canvas
   */
  async fetchCourses(userId: string): Promise<CanvasGrade[]> {
    const token = await this.getCanvasToken(userId);
    const baseUrl = this.getCanvasBaseUrl();

    if (!token || !baseUrl) {
      console.warn('Canvas not connected - missing token or base URL');
      return [];
    }

    try {
      const response = await fetch(`${baseUrl}/api/v1/courses?enrollment_state=active&include[]=total_scores`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          console.error('Canvas token expired or invalid');
          return [];
        }
        throw new Error(`Canvas API error: ${response.statusText}`);
      }

      const courses: CanvasCourse[] = await response.json();
      console.log('📚 Fetched Canvas courses:', courses);

      const canvasGrades: CanvasGrade[] = [];

      for (const course of courses) {
        const enrollment = course.enrollments?.find(e => e.type === 'student');
        const currentGrade = enrollment?.computed_current_score || 0;

        // Fetch assignments for this course
        const assignments = await this.fetchAssignments(baseUrl, token, course.id);

        canvasGrades.push({
          courseId: course.id.toString(),
          courseName: course.name,
          courseCode: course.course_code,
          currentGrade,
          assignments
        });
      }

      return canvasGrades;
    } catch (error) {
      console.error('Error fetching Canvas courses:', error);
      return [];
    }
  },

  /**
   * Fetch assignments for a specific course
   */
  async fetchAssignments(baseUrl: string, token: string, courseId: number): Promise<CanvasGrade['assignments']> {
    try {
      const response = await fetch(
        `${baseUrl}/api/v1/courses/${courseId}/assignments?include[]=submission&per_page=50`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        }
      );

      if (!response.ok) {
        console.error(`Failed to fetch assignments for course ${courseId}`);
        return [];
      }

      const assignments: CanvasAssignment[] = await response.json();

      return assignments
        .filter(a => a.submission && a.submission.score != null)
        .map(a => ({
          id: a.id.toString(),
          name: a.name,
          score: a.submission?.score || 0,
          maxScore: a.points_possible,
          dueDate: a.due_at || undefined,
          submittedAt: a.submission?.submitted_at || undefined
        }));
    } catch (error) {
      console.error(`Error fetching assignments for course ${courseId}:`, error);
      return [];
    }
  },

  /**
   * Check if Canvas is connected for the current user
   */
  async isConnected(userId: string): Promise<boolean> {
    const token = await this.getCanvasToken(userId);
    const baseUrl = this.getCanvasBaseUrl();
    return !!(token && baseUrl);
  },

  /**
   * Sync Canvas grades to local database (courses and assignments tables)
   */
  async syncToDatabase(userId: string): Promise<void> {
    const canvasGrades = await this.fetchCourses(userId);

    if (canvasGrades.length === 0) {
      console.log('No Canvas grades to sync');
      return;
    }

    console.log('🔄 Syncing Canvas grades to database...');

    for (const grade of canvasGrades) {
      try {
        // Check if course already exists
        const { data: existingCourse } = await supabase
          .from('courses')
          .select('id')
          .eq('user_id', userId)
          .eq('code', grade.courseCode)
          .single();

        let courseId: string;

        if (existingCourse) {
          // Update existing course
          const { data: updated } = await supabase
            .from('courses')
            .update({
              name: grade.courseName,
              current_grade: grade.currentGrade,
              updated_at: new Date().toISOString()
            })
            .eq('id', existingCourse.id)
            .select()
            .single();

          courseId = updated.id;
          console.log(`✅ Updated course: ${grade.courseCode}`);
        } else {
          // Create new course
          const { data: created } = await supabase
            .from('courses')
            .insert([{
              user_id: userId,
              name: grade.courseName,
              code: grade.courseCode,
              credits: 3, // Default, user can edit
              current_grade: grade.currentGrade,
              target_grade: 90, // Default
              color: this.getRandomColor()
            }])
            .select()
            .single();

          courseId = created.id;
          console.log(`✅ Created course: ${grade.courseCode}`);
        }

        // Sync assignments for this course
        for (const assignment of grade.assignments) {
          const { data: existingAssignment } = await supabase
            .from('assignments')
            .select('id')
            .eq('course_id', courseId)
            .eq('name', assignment.name)
            .single();

          if (existingAssignment) {
            // Update existing assignment
            await supabase
              .from('assignments')
              .update({
                score: assignment.score,
                max_score: assignment.maxScore,
                updated_at: new Date().toISOString()
              })
              .eq('id', existingAssignment.id);
          } else {
            // Create new assignment
            await supabase
              .from('assignments')
              .insert([{
                user_id: userId,
                course_id: courseId,
                name: assignment.name,
                category: 'homework', // Default category
                score: assignment.score,
                max_score: assignment.maxScore,
                weight: 1,
                due_date: assignment.dueDate || null
              }]);
          }
        }
      } catch (error) {
        console.error(`Error syncing course ${grade.courseCode}:`, error);
      }
    }

    console.log('✅ Canvas sync complete!');
  },

  getRandomColor(): string {
    const colors = [
      'bg-blue-500',
      'bg-purple-500',
      'bg-green-500',
      'bg-red-500',
      'bg-yellow-500',
      'bg-indigo-500',
      'bg-pink-500',
      'bg-teal-500'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }
};
