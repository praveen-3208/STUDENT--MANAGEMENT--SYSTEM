export interface Student {
  id: number;
  name: string;
  email: string;
  phone: string;
  date_of_birth: string;
  course: string;
  enrollment_date: string;
  status: 'active' | 'inactive';
}

export interface StudentFormData {
  name: string;
  email: string;
  phone: string;
  date_of_birth: string;
  course: string;
  status: 'active' | 'inactive';
}

export interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
  date_of_birth?: string;
  course?: string;
  status?: string;
  [key: string]: string | undefined;
}
