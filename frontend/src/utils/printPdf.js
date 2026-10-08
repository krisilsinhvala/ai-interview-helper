/**
 * Generates a clean, vector-quality PDF printout of the interview report using a dynamic hidden iframe.
 * @param {Object} interview - The interview session details and questions array
 * @param {string} userName - Name of the user
 */
export const exportInterviewToPdf = (interview, userName = "Candidate") => {
  if (!interview) return;

  // Create dynamic hidden iframe
  const iframe = document.createElement("iframe");
  iframe.style.position = "fixed";
  iframe.style.right = "0";
  iframe.style.bottom = "0";
  iframe.style.width = "0";
  iframe.style.height = "0";
  iframe.style.border = "0";
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow.document;

  const questionsHtml = interview.questions
    .map((q, idx) => `
      <div class="question-box">
        <div class="q-header">
          <span class="q-num">Question ${idx + 1} of ${interview.questions.length}</span>
          <span class="q-category">${q.category || "Technical"} • ${q.difficulty || "Medium"}</span>
          <span class="q-score">Score: ${q.userScore !== null && q.userScore !== undefined ? q.userScore + "/10" : "N/A"}</span>
        </div>
        <div class="q-title">${q.question}</div>
        
        <div class="section-block">
          <div class="section-label">Candidate Answer:</div>
          <div class="section-content">${q.userAnswer ? q.userAnswer.replace(/\n/g, '<br/>') : '<em>Skipped / Not Answered</em>'}</div>
        </div>

        <div class="section-block">
          <div class="section-label">Ideal Model Answer:</div>
          <div class="section-content ideal">${q.idealAnswer ? q.idealAnswer.replace(/\n/g, '<br/>') : 'N/A'}</div>
        </div>

        ${q.feedback ? `
        <div class="section-block">
          <div class="section-label">AI Feedback & Analysis:</div>
          <div class="section-content feedback">${q.feedback}</div>
        </div>
        ` : ''}

        ${q.strengths && q.strengths.length > 0 ? `
        <div class="tags-row">
          <strong>Key Strengths:</strong> ${q.strengths.map(s => `<span class="tag tag-green">${s}</span>`).join(' ')}
        </div>
        ` : ''}

        ${q.weaknesses && q.weaknesses.length > 0 ? `
        <div class="tags-row">
          <strong>Areas for Improvement:</strong> ${q.weaknesses.map(w => `<span class="tag tag-red">${w}</span>`).join(' ')}
        </div>
        ` : ''}
      </div>
    `)
    .join("");

  const printDocumentHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>${interview.interviewTitle || "AI Interview Preparation Report"}</title>
        <style>
          @page {
            size: A4;
            margin: 20mm;
          }
          body {
            font-family: 'Helvetica Neue', Arial, sans-serif;
            color: #1e293b;
            line-height: 1.5;
            margin: 0;
            padding: 0;
          }
          .report-header {
            border-bottom: 2px solid #6366f1;
            padding-bottom: 12px;
            margin-bottom: 20px;
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
          }
          .brand-title {
            font-size: 22px;
            font-weight: 800;
            color: #4f46e5;
          }
          .report-meta {
            font-size: 12px;
            color: #64748b;
            text-align: right;
          }
          .summary-card {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 16px;
            margin-bottom: 24px;
            display: flex;
            justify-content: space-around;
            text-align: center;
          }
          .metric {
            display: flex;
            flex-direction: column;
          }
          .metric-val {
            font-size: 20px;
            font-weight: 700;
            color: #4f46e5;
          }
          .metric-lbl {
            font-size: 11px;
            color: #64748b;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .question-box {
            border: 1px solid #cbd5e1;
            border-radius: 8px;
            padding: 16px;
            margin-bottom: 20px;
            page-break-inside: avoid;
          }
          .q-header {
            display: flex;
            justify-content: space-between;
            font-size: 12px;
            color: #64748b;
            margin-bottom: 6px;
          }
          .q-score {
            font-weight: 700;
            color: #10b981;
          }
          .q-title {
            font-size: 15px;
            font-weight: 700;
            color: #0f172a;
            margin-bottom: 12px;
          }
          .section-block {
            margin-bottom: 10px;
          }
          .section-label {
            font-size: 11px;
            font-weight: 700;
            color: #475569;
            text-transform: uppercase;
          }
          .section-content {
            font-size: 13px;
            background: #f1f5f9;
            padding: 8px 12px;
            border-radius: 4px;
            margin-top: 4px;
          }
          .section-content.ideal {
            background: #eef2ff;
            border-left: 3px solid #6366f1;
          }
          .section-content.feedback {
            background: #f0fdf4;
            border-left: 3px solid #10b981;
          }
          .tags-row {
            font-size: 12px;
            margin-top: 8px;
          }
          .tag {
            display: inline-block;
            padding: 2px 8px;
            border-radius: 12px;
            font-size: 11px;
            font-weight: 600;
            margin-right: 4px;
          }
          .tag-green { background: #dcfce7; color: #15803d; }
          .tag-red { background: #fee2e2; color: #b91c1c; }
        </style>
      </head>
      <body>
        <div class="report-header">
          <div>
            <div class="brand-title">PrepMind AI Report</div>
            <div style="font-size: 14px; font-weight: 600; color: #334155;">${interview.interviewTitle}</div>
          </div>
          <div class="report-meta">
            <div><strong>Candidate:</strong> ${userName}</div>
            <div><strong>Role:</strong> ${interview.jobRole} (${interview.experience})</div>
            <div><strong>Date:</strong> ${new Date(interview.createdAt).toLocaleDateString()}</div>
          </div>
        </div>

        <div class="summary-card">
          <div class="metric">
            <span class="metric-val">${interview.overallScore || 0} / 10</span>
            <span class="metric-lbl">Overall Score</span>
          </div>
          <div class="metric">
            <span class="metric-val">${interview.technicalScore || 0}%</span>
            <span class="metric-lbl">Technical Depth</span>
          </div>
          <div class="metric">
            <span class="metric-val">${interview.communicationScore || 0}%</span>
            <span class="metric-lbl">Communication</span>
          </div>
          <div class="metric">
            <span class="metric-val">${interview.questions.length}</span>
            <span class="metric-lbl">Total Questions</span>
          </div>
        </div>

        ${questionsHtml}
      </body>
    </html>
  `;

  doc.open();
  doc.write(printDocumentHtml);
  doc.close();

  // Trigger print after resources load
  setTimeout(() => {
    iframe.contentWindow.focus();
    iframe.contentWindow.print();
    setTimeout(() => {
      document.body.removeChild(iframe);
    }, 1000);
  }, 500);
};
