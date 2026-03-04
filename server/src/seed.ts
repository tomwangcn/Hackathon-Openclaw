import bcrypt from "bcryptjs";
import { prisma } from "./db.js";

async function seed() {
  console.log("Seeding database...");

  await prisma.notification.deleteMany();
  await prisma.jiraTicket.deleteMany();
  await prisma.finding.deleteMany();
  await prisma.report.deleteMany();
  await prisma.message.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.artifact.deleteMany();
  await prisma.sessionEvent.deleteMany();
  await prisma.sessionTaskResult.deleteMany();
  await prisma.session.deleteMany();
  await prisma.assignment.deleteMany();
  await prisma.studyPublication.deleteMany();
  await prisma.studyTask.deleteMany();
  await prisma.study.deleteMany();
  await prisma.testerProfile.deleteMany();
  await prisma.jiraConfig.deleteMany();
  await prisma.orgMembership.deleteMany();
  await prisma.organization.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash("password123", 10);

  // Organizations
  const org = await prisma.organization.create({ data: { name: "AcmeShop" } });
  const nhsOrg = await prisma.organization.create({ data: { name: "NHS England" } });

  // Business users
  const businessUser = await prisma.user.create({
    data: { email: "business@openclaw.dev", passwordHash, role: "business", name: "Sarah Chen" },
  });
  await prisma.orgMembership.create({
    data: { userId: businessUser.id, orgId: org.id, role: "admin" },
  });

  const nhsUser = await prisma.user.create({
    data: { email: "nhs@openclaw.dev", passwordHash, role: "business", name: "Dr James Wilson" },
  });
  await prisma.orgMembership.create({
    data: { userId: nhsUser.id, orgId: nhsOrg.id, role: "admin" },
  });

  // Tester users
  const testers = await Promise.all([
    prisma.user.create({ data: { email: "tester1@openclaw.dev", passwordHash, role: "tester", name: "Alex Rivera" } }),
    prisma.user.create({ data: { email: "tester2@openclaw.dev", passwordHash, role: "tester", name: "Jamie Park" } }),
    prisma.user.create({ data: { email: "tester3@openclaw.dev", passwordHash, role: "tester", name: "Morgan Blake" } }),
  ]);

  for (const tester of testers) {
    await prisma.testerProfile.create({ data: { userId: tester.id } });
  }

  // Study 1: Active with sessions
  const study1 = await prisma.study.create({
    data: {
      orgId: org.id,
      name: "Checkout Flow Accessibility Audit",
      goal: "Evaluate the checkout flow for cognitive accessibility barriers. We're seeing a 40% drop-off rate among users who self-report ADHD or dyslexia.",
      targetUrls: JSON.stringify(["https://staging.acmeshop.com/checkout"]),
      wcagLevel: "AA",
      focusAreas: JSON.stringify(["Cognitive Load", "Forms", "Navigation"]),
      status: "active",
      maxTesters: 10,
      timeEstimate: "20 min",
    },
  });

  const study1Tasks = await Promise.all([
    prisma.studyTask.create({ data: { studyId: study1.id, title: "Complete the sign-up flow", description: "Navigate to the homepage, find the sign-up button, and create an account using the test credentials provided.", successCriteria: "Account created and dashboard visible", sortOrder: 1 } }),
    prisma.studyTask.create({ data: { studyId: study1.id, title: "Search for a product", description: 'Use the search functionality to find "wireless headphones" and navigate to the first result.', successCriteria: "Product detail page is displayed", sortOrder: 2 } }),
    prisma.studyTask.create({ data: { studyId: study1.id, title: "Complete checkout process", description: "Add the product to cart and complete the checkout using the test payment details.", successCriteria: "Order confirmation page shown with order number", sortOrder: 3 } }),
  ]);

  await prisma.studyPublication.create({ data: { studyId: study1.id } });

  // Assignments & sessions for study 1
  for (let i = 0; i < testers.length; i++) {
    await prisma.assignment.create({ data: { studyId: study1.id, testerId: testers[i].id } });
    const status = i === 0 ? "in_session" : i === 1 ? "completed" : "not_started";
    const session = await prisma.session.create({
      data: {
        studyId: study1.id,
        testerId: testers[i].id,
        status,
        startedAt: status !== "not_started" ? new Date(Date.now() - 3600000) : null,
        endedAt: status === "completed" ? new Date(Date.now() - 1800000) : null,
      },
    });

    if (status === "in_session" || status === "completed") {
      await prisma.sessionTaskResult.create({ data: { sessionId: session.id, taskId: study1Tasks[0].id, completed: true } });
      await prisma.sessionTaskResult.create({ data: { sessionId: session.id, taskId: study1Tasks[1].id, completed: status === "completed" } });
    }
  }

  // Study 2: Published, no sessions yet
  const study2 = await prisma.study.create({
    data: {
      orgId: org.id,
      name: "Onboarding Redesign",
      goal: "Test the new onboarding flow for first-time users.",
      targetUrls: JSON.stringify(["https://staging.acmeshop.com/onboarding"]),
      wcagLevel: "AA",
      focusAreas: JSON.stringify(["Navigation", "Content Clarity"]),
      status: "published",
      maxTesters: 5,
      timeEstimate: "15 min",
    },
  });

  await Promise.all([
    prisma.studyTask.create({ data: { studyId: study2.id, title: "Complete onboarding wizard", description: "Follow all steps of the onboarding flow.", successCriteria: "Reaches dashboard", sortOrder: 1 } }),
    prisma.studyTask.create({ data: { studyId: study2.id, title: "Set up profile", description: "Navigate to settings and fill in profile information.", successCriteria: "Profile saved successfully", sortOrder: 2 } }),
  ]);

  await prisma.studyPublication.create({ data: { studyId: study2.id } });

  // Study 3: Draft
  await prisma.study.create({
    data: {
      orgId: org.id,
      name: "Mobile Navigation",
      goal: "Evaluate mobile navigation patterns.",
      status: "draft",
    },
  });

  // Study 4: NHS — real website demo
  const nhsStudy = await prisma.study.create({
    data: {
      orgId: nhsOrg.id,
      name: "NHS Digital Portal Navigation Audit",
      goal: "Evaluate the NHS website for screen reader compatibility and cognitive accessibility across patient-facing pages.",
      targetUrls: JSON.stringify(["https://www.nhs.uk"]),
      wcagLevel: "AA",
      focusAreas: JSON.stringify(["Navigation", "Cognitive Load", "Reading"]),
      status: "active",
      maxTesters: 10,
      timeEstimate: "45 min",
      captureWebcam: true,
    },
  });

  const nhsTasks = await Promise.all([
    prisma.studyTask.create({ data: { studyId: nhsStudy.id, title: "Navigate to the Health A-Z page", description: "From the homepage, find and navigate to the Health A-Z section.", successCriteria: "Health A-Z page is displayed", sortOrder: 1 } }),
    prisma.studyTask.create({ data: { studyId: nhsStudy.id, title: "Search for a condition", description: "Use the search functionality to find information about 'diabetes'.", successCriteria: "Diabetes information page is displayed", sortOrder: 2 } }),
    prisma.studyTask.create({ data: { studyId: nhsStudy.id, title: "Find GP services near you", description: "Navigate to 'Find services' and search for GP surgeries using a postcode.", successCriteria: "Search results with GP listings are shown", sortOrder: 3 } }),
    prisma.studyTask.create({ data: { studyId: nhsStudy.id, title: "Explore the NHS App page", description: "Find the NHS App page and review the key features listed.", successCriteria: "NHS App page is displayed with feature list", sortOrder: 4 } }),
    prisma.studyTask.create({ data: { studyId: nhsStudy.id, title: "Locate mental health support", description: "Navigate to mental health resources and find the crisis support section.", successCriteria: "Mental health support page or urgent help section is shown", sortOrder: 5 } }),
  ]);

  await prisma.studyPublication.create({ data: { studyId: nhsStudy.id } });

  await prisma.assignment.create({ data: { studyId: nhsStudy.id, testerId: testers[0].id } });
  const nhsSession = await prisma.session.create({
    data: { studyId: nhsStudy.id, testerId: testers[0].id, status: "not_started" },
  });

  // Study 5: GOV.UK — real website demo
  const govStudy = await prisma.study.create({
    data: {
      orgId: nhsOrg.id,
      name: "GOV.UK Benefits Application Form Review",
      goal: "Assess government service pages for neurodivergent users — focusing on reading level, form complexity, and motor demands.",
      targetUrls: JSON.stringify(["https://www.gov.uk"]),
      wcagLevel: "AA",
      focusAreas: JSON.stringify(["Forms", "Reading", "Motor", "Cognitive Load"]),
      status: "active",
      maxTesters: 8,
      timeEstimate: "40 min",
    },
  });

  await Promise.all([
    prisma.studyTask.create({ data: { studyId: govStudy.id, title: "Find Universal Credit information", description: "Navigate to the Universal Credit section from the homepage.", successCriteria: "Universal Credit page is displayed", sortOrder: 1 } }),
    prisma.studyTask.create({ data: { studyId: govStudy.id, title: "Check eligibility for a benefit", description: "Use the benefits calculator or eligibility checker.", successCriteria: "Eligibility result or calculator page shown", sortOrder: 2 } }),
    prisma.studyTask.create({ data: { studyId: govStudy.id, title: "Find contact information", description: "Locate the contact page for DWP or Jobcentre Plus.", successCriteria: "Contact details displayed", sortOrder: 3 } }),
  ]);

  await prisma.studyPublication.create({ data: { studyId: govStudy.id } });

  await prisma.assignment.create({ data: { studyId: govStudy.id, testerId: testers[0].id } });
  await prisma.session.create({
    data: { studyId: govStudy.id, testerId: testers[0].id, status: "not_started" },
  });

  // Report for study 1
  const report = await prisma.report.create({
    data: {
      studyId: study1.id,
      status: "ready",
      summary: "The checkout flow presents significant accessibility barriers for neurodiverse users, particularly in the payment and shipping form steps.",
      reportJson: JSON.stringify({ studyName: study1.name, totalSessions: 2 }),
    },
  });

  await Promise.all([
    prisma.finding.create({ data: { reportId: report.id, severity: "critical", title: "Payment form loses focus after validation error", description: "When a validation error occurs, keyboard focus is moved to the top of the page.", frequency: "87% of sessions", confidence: 94, evidenceCount: 12 } }),
    prisma.finding.create({ data: { reportId: report.id, severity: "critical", title: "Cart total not announced to screen readers after update", description: "Updated cart total is not announced via ARIA live regions.", frequency: "73% of sessions", confidence: 91, evidenceCount: 8 } }),
    prisma.finding.create({ data: { reportId: report.id, severity: "high", title: "Shipping form cognitive overload", description: "The shipping address form displays all 14 fields at once without progressive disclosure.", frequency: "65% of sessions", confidence: 88, evidenceCount: 15 } }),
  ]);

  await Promise.all([
    prisma.jiraTicket.create({ data: { reportId: report.id, title: "Fix focus management after payment validation errors", description: "Move keyboard focus to the first validation error message when payment form validation fails.", priority: "Critical", labels: JSON.stringify(["a11y", "forms", "keyboard-nav"]), acceptanceCriteria: JSON.stringify(["Focus moves to first error message", "Error announced by screen readers"]), selected: true } }),
    prisma.jiraTicket.create({ data: { reportId: report.id, title: "Add ARIA live region for cart total updates", description: "Implement aria-live='polite' region to announce cart total changes.", priority: "Critical", labels: JSON.stringify(["a11y", "aria", "screen-reader"]), acceptanceCriteria: JSON.stringify(["Cart total changes announced via aria-live"]), selected: true } }),
  ]);

  // Conversation for study 1
  const conv = await prisma.conversation.create({
    data: { studyId: study1.id, channel: "web", agentType: "study_designer" },
  });

  await prisma.message.create({
    data: { conversationId: conv.id, role: "agent", content: "Hi! I'm your Study Designer Agent. I'll help you create an effective accessibility study. What specific user groups are you targeting?" },
  });
  await prisma.message.create({
    data: { conversationId: conv.id, role: "user", content: "We want to focus on users with ADHD and dyslexia. Our analytics show a 40% drop-off at checkout.", senderId: businessUser.id },
  });

  // Jira config
  await prisma.jiraConfig.create({
    data: { orgId: org.id, siteUrl: "acmeshop.atlassian.net", projectKey: "ACME" },
  });

  console.log("Seed complete!");
  console.log("\nTest accounts:");
  console.log("  Business: business@openclaw.dev / password123");
  console.log("  Tester 1: tester1@openclaw.dev / password123");
  console.log("  Tester 2: tester2@openclaw.dev / password123");
  console.log("  Tester 3: tester3@openclaw.dev / password123");
}

seed()
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
