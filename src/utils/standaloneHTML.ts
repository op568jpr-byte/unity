import { Student, Payment, HostelSettings, Complaint, Visitor, PartnerWithdrawal, HostelExpense } from '../types';

export async function generateStandaloneHTML(
  students: Student[],
  payments: Payment[],
  settings: HostelSettings,
  complaints: Complaint[] = [],
  visitors: Visitor[] = [],
  partnerWithdrawals: PartnerWithdrawal[] = [],
  expenses: HostelExpense[] = []
): Promise<string> {
  let template = '';
  try {
    const response = await fetch('/standalone_index.html');
    if (response.ok) {
      template = await response.text();
    }
  } catch (e) {
    console.error('Failed to fetch standalone_index.html from server:', e);
  }

  if (!template) {
    // Fallback: use outerHTML of active document
    template = document.documentElement.outerHTML;
  }

  // Clean up any existing standalone bootstrap script in the DOM before saving
  template = template.replace(/<script id="standalone-bootstrap">[\s\S]*?<\/script>/g, '');

  const bootstrapScript = `
<script id="standalone-bootstrap">
  window.MEMORY_STORE = {
    "ubh_students": ${JSON.stringify(students)},
    "ubh_payments": ${JSON.stringify(payments)},
    "ubh_settings": ${JSON.stringify(settings)},
    "ubh_complaints": ${JSON.stringify(complaints)},
    "ubh_visitors": ${JSON.stringify(visitors)},
    "ubh_partner_withdrawals": ${JSON.stringify(partnerWithdrawals)},
    "ubh_hostel_expenses": ${JSON.stringify(expenses)}
  };
</script>
`;

  // Inject the bootstrap script into the template
  if (template.includes('</head>')) {
    template = template.replace('</head>', `${bootstrapScript}\n</head>`);
  } else if (template.includes('<head>')) {
    template = template.replace('<head>', `<head>\n${bootstrapScript}`);
  } else {
    template = bootstrapScript + '\n' + template;
  }

  // Ensure DOCTYPE is present
  if (!template.startsWith('<!DOCTYPE html>')) {
    template = '<!DOCTYPE html>\n' + template;
  }

  return template;
}


