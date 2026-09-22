const { jsPDF } = require('jspdf');
const fs = require('fs');
const path = require('path');

function createMilestoneReportPdf() {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  // Header background bar
  doc.setFillColor(27, 67, 50); // #1B4332
  doc.rect(0, 0, 210, 28, 'F');

  // Header Title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('INTERNSHIP PLATFORM • OFFICIAL REPORT', 15, 14);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(200, 230, 215);
  doc.text('Academic & Industry Internship Management System • 2025-2026', 15, 21);

  // Document Badge
  doc.setFillColor(234, 247, 238);
  doc.roundedRect(15, 36, 180, 22, 2, 2, 'F');
  doc.setDrawColor(30, 126, 52);
  doc.roundedRect(15, 36, 180, 22, 2, 2, 'S');

  doc.setTextColor(30, 126, 52);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('SPRING MILESTONE 2 - EVALUATION & PROGRESS REPORT', 20, 46);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(80, 100, 90);
  doc.text('Status: APPROVED & SIGNED • Credential ID: IF-2025-0894 • Version 3.0', 20, 53);

  // Metadata Grid
  doc.setFillColor(248, 250, 249);
  doc.roundedRect(15, 65, 180, 36, 2, 2, 'F');
  doc.setDrawColor(220, 230, 225);
  doc.roundedRect(15, 65, 180, 36, 2, 2, 'S');

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(40, 50, 45);
  doc.text('Student Intern:', 20, 74);
  doc.text('Host Partner:', 20, 84);
  doc.text('Mentor:', 20, 94);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(20, 30, 25);
  doc.text('Ana Popescu (Computer Science & Software Engineering)', 55, 74);
  doc.text('Tech Innovations SRL - Cloud Solutions Division', 55, 84);
  doc.text('Dr. Michael Chen (Senior Engineering Lead)', 55, 94);

  doc.setFont('helvetica', 'bold');
  doc.text('Date:', 135, 74);
  doc.text('Coordinator:', 135, 84);
  doc.text('Category:', 135, 94);

  doc.setFont('helvetica', 'normal');
  doc.text('October 24, 2025', 160, 74);
  doc.text('Elena Vasilescu', 160, 84);
  doc.text('Milestone Reports', 160, 94);

  // Section 1: Executive Summary
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(27, 67, 50);
  doc.text('1. Executive Summary & Core Objectives', 15, 112);

  doc.setDrawColor(27, 67, 50);
  doc.setLineWidth(0.5);
  doc.line(15, 114, 195, 114);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(50, 60, 55);
  const summaryText = 
    "During this second internship milestone, the intern participated actively in developing, testing, and " +
    "deploying core enterprise microservices. Deliverables included backend API enhancements, secure database " +
    "migrations, and responsive user interfaces built according to industry standard architectural patterns.";
  doc.text(doc.splitTextToSize(summaryText, 180), 15, 121);

  // Section 2: Key Milestones Achieved
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(27, 67, 50);
  doc.text('2. Key Deliverables & Performance Rubric', 15, 142);
  doc.line(15, 144, 195, 144);

  const items = [
    { title: 'Full-Stack Feature Integration', score: '9.8 / 10', grade: 'Exceeds Expectations' },
    { title: 'Code Quality, Linting & Unit Testing (88% Coverage)', score: '9.5 / 10', grade: 'Outstanding' },
    { title: 'API Documentation & OpenAPI Specifications', score: '9.7 / 10', grade: 'Exceeds Expectations' },
    { title: 'Team Collaboration, Code Reviews & Demo Presentation', score: '10.0 / 10', grade: 'Exemplary' }
  ];

  let y = 152;
  items.forEach((item, index) => {
    doc.setFillColor(index % 2 === 0 ? 245 : 255, index % 2 === 0 ? 248 : 255, index % 2 === 0 ? 246 : 255);
    doc.rect(15, y - 4, 180, 8, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(40, 50, 45);
    doc.text(`•  ${item.title}`, 18, y + 1);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(30, 126, 52);
    doc.text(item.score, 140, y + 1);
    doc.text(item.grade, 160, y + 1);
    y += 9;
  });

  // Section 3: Signatures & Digital Seal
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(27, 67, 50);
  doc.text('3. Formal Verification & Digital Signatures', 15, 202);
  doc.line(15, 204, 195, 204);

  // Signatures boxes
  // Box 1: Intern
  doc.setFillColor(250, 252, 250);
  doc.setDrawColor(210, 225, 215);
  doc.roundedRect(15, 210, 55, 35, 1.5, 1.5, 'FD');
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(80, 90, 85);
  doc.text('INTERN SIGNATURE', 20, 217);
  doc.setFont('times', 'italic');
  doc.setFontSize(13);
  doc.setTextColor(20, 30, 25);
  doc.text('Ana Popescu', 23, 229);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(100, 110, 105);
  doc.text('Digitally signed 2025-10-24', 20, 239);

  // Box 2: Mentor
  doc.roundedRect(77, 210, 55, 35, 1.5, 1.5, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(80, 90, 85);
  doc.text('MENTOR APPROVAL', 82, 217);
  doc.setFont('times', 'italic');
  doc.setFontSize(13);
  doc.setTextColor(27, 67, 50);
  doc.text('Dr. Michael Chen', 85, 229);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(100, 110, 105);
  doc.text('Digitally signed & approved', 82, 239);

  // Box 3: Coordinator
  doc.roundedRect(140, 210, 55, 35, 1.5, 1.5, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(80, 90, 85);
  doc.text('UNIVERSITY COORDINATOR', 145, 217);
  doc.setFont('times', 'italic');
  doc.setFontSize(13);
  doc.setTextColor(20, 30, 25);
  doc.text('Elena Vasilescu', 148, 229);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(100, 110, 105);
  doc.text('Validated & stamped 2025-10-25', 145, 239);

  // Footer
  doc.setDrawColor(200, 215, 205);
  doc.setLineWidth(0.3);
  doc.line(15, 275, 195, 275);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(120, 130, 125);
  doc.text('Internship Platform Vault • Security Stamp #7719-X • Encrypted SHA-256 Audit Trail', 15, 281);
  doc.text('Page 1 of 1', 180, 281);

  return Buffer.from(doc.output('arraybuffer'));
}

function createCompliancePdf() {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  doc.setFillColor(30, 50, 80);
  doc.rect(0, 0, 210, 28, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(15);
  doc.setFont('helvetica', 'bold');
  doc.text('HEALTH & SAFETY COMPLIANCE AGREEMENT', 15, 14);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(190, 210, 240);
  doc.text('Institutional Compliance & Workplace Safety Standard Form', 15, 21);

  doc.setFillColor(245, 247, 252);
  doc.roundedRect(15, 36, 180, 22, 2, 2, 'F');
  doc.setDrawColor(70, 110, 180);
  doc.roundedRect(15, 36, 180, 22, 2, 2, 'S');

  doc.setTextColor(30, 60, 120);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text('INSTITUTIONAL SAFETY & REGULATORY CLEARANCE', 20, 46);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(70, 80, 100);
  doc.text('Reference: HSE-2025-04 • Validity: 2025-2026 Academic Year', 20, 53);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(40, 40, 40);
  const terms = [
    "1. The student intern confirms completion of initial occupational safety training modules.",
    "2. Host organization maintains compliance with standard workplace ergonomics and safety standards.",
    "3. Tripartite confidentiality and intellectual property terms are acknowledged and accepted.",
    "4. Emergency contact and reporting protocols have been communicated to all involved parties."
  ];

  let y = 70;
  terms.forEach(term => {
    doc.text(term, 15, y);
    y += 10;
  });

  // Signatures
  doc.setDrawColor(180, 190, 205);
  doc.line(15, 120, 85, 120);
  doc.line(125, 120, 195, 120);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('Ana Popescu (Student)', 15, 126);
  doc.text('Host Company Representative', 125, 126);

  return Buffer.from(doc.output('arraybuffer'));
}

const reportPdf = createMilestoneReportPdf();
const compliancePdf = createCompliancePdf();

const targetDirs = [
  path.resolve(__dirname, '../public'),
  path.resolve(__dirname, '../public/uploads'),
  path.resolve(__dirname, '../../backend/InternshipPlatform.API/wwwroot/uploads')
];

targetDirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Write to public/dummy.pdf
fs.writeFileSync(path.resolve(__dirname, '../public/dummy.pdf'), reportPdf);
fs.writeFileSync(path.resolve(__dirname, '../public/uploads/Spring_Milestone_2_Report.pdf'), reportPdf);
fs.writeFileSync(path.resolve(__dirname, '../public/uploads/Health_Safety_Compliance_Form.pdf'), compliancePdf);

fs.writeFileSync(path.resolve(__dirname, '../../backend/InternshipPlatform.API/wwwroot/uploads/dummy.pdf'), reportPdf);
fs.writeFileSync(path.resolve(__dirname, '../../backend/InternshipPlatform.API/wwwroot/uploads/Spring_Milestone_2_Report.pdf'), reportPdf);
fs.writeFileSync(path.resolve(__dirname, '../../backend/InternshipPlatform.API/wwwroot/uploads/Health_Safety_Compliance_Form.pdf'), compliancePdf);

console.log('Successfully generated professional PDF documents!');
