// Data layer. DEMO MODE stores data in the browser (localStorage).
// To go "full cloud", replace the bodies of load()/save() with calls to your
// API Gateway + Lambda + DynamoDB backend (see backend/README.md).
const DAY = 864e5;
function seed() {
  const now = Date.now(), iso = (d) => new Date(now + d * DAY).toISOString();
  return {
    users: [
      { id: 's1', name: 'Aarav Sharma', email: 'aarav@college.edu', role: 'student', password: 'demo123' },
      { id: 's2', name: 'Priya Nair', email: 'priya@college.edu', role: 'student', password: 'demo123' },
      { id: 't1', name: 'Prof. Meera Iyer', email: 'meera@college.edu', role: 'teacher', password: 'demo123' }
    ],
    assignments: [
      { id: 'a1', title: 'Database Normalization Report', subject: 'DBMS', teacherId: 't1', created: iso(-10), deadline: iso(-2),
        description: 'Normalize the given schema up to 3NF.', instructions: 'Show every step. Submit a PDF, max 5 MB.' },
      { id: 'a2', title: 'AWS Cloud Architecture Diagram', subject: 'Cloud Computing', teacherId: 't1', created: iso(-5), deadline: iso(3),
        description: 'Design a 3-tier architecture on AWS.', instructions: 'Include VPC, subnets, EC2/Lambda and a database. PDF or DOCX.' },
      { id: 'a3', title: 'Sorting Algorithms Analysis', subject: 'Data Structures', teacherId: 't1', created: iso(-4), deadline: iso(6),
        description: 'Compare bubble, merge and quick sort.', instructions: 'Include time complexity tables and sample runs.' },
      { id: 'a4', title: 'Git Workflow Documentation', subject: 'Software Engineering', teacherId: 't1', created: iso(-1), deadline: iso(9),
        description: 'Document a feature-branch Git workflow.', instructions: 'Add screenshots of commits and a pull request.' }
    ],
    submissions: [
      { id: 'u1', assignmentId: 'a1', studentId: 's1', studentName: 'Aarav Sharma', date: iso(-4), fileName: 'normalization_aarav.pdf', notes: '', status: 'Reviewed' },
      { id: 'u2', assignmentId: 'a2', studentId: 's1', studentName: 'Aarav Sharma', date: iso(-1), fileName: 'aws_diagram_aarav.pdf', notes: 'Used Lambda + DynamoDB.', status: 'Submitted' },
      { id: 'u3', assignmentId: 'a2', studentId: 's2', studentName: 'Priya Nair', date: iso(-1), fileName: 'cloud_arch_priya.docx', notes: '', status: 'Submitted' }
    ]
  };
}
const DB = {
  key: 'sas_db_v1',
  load() { let d = localStorage.getItem(this.key); if (d) return JSON.parse(d); d = seed(); this.save(d); return d; },
  save(d) { localStorage.setItem(this.key, JSON.stringify(d)); },
  reset() { localStorage.removeItem(this.key); }
};
