// Made-up test emails in the exact layouts seen in the estimating@ inbox.
// This repo is public: no real people, projects, links or access codes here.

import type { EmailInput } from "./types";

const wrap = (url: string) =>
  "https://urldefense.proofpoint.com/v2/url?u=" +
  url.replace(/[:?=&-]/g, (c) => "-" + c.charCodeAt(0).toString(16).toUpperCase()).replace(/\//g, "_") +
  "&amp;d=DwMCAQ&amp;c=x&amp;r=x&amp;m=x&amp;s=x&amp;e=";

export const blueBookInvite: EmailInput = {
  fromAddress: "ExampleBuildersLLC.oneteam.build@bbbid.thebluebook.com",
  fromName: "Example Builders LLC",
  subject: "Invitation to Bid from Jordan Sample",
  receivedAt: "2026-10-16T14:21:40Z",
  html: `<table><tr><td><b>Invitation to Bid</b></td></tr>
<tr><td>Bid is due by 5:00 PM (Eastern) on November 6, 2026 </td></tr>
<tr><td><b>Example Builders LLC has invited you to bid on Riverside Middle Entrance Renovation.</b></td></tr>
<tr><td>We are looking for <br />Structural Steel Fabricators<br />Ironwork--Miscellaneous &amp; Ornamental. </td></tr>
<tr><td><a href="${wrap("http://ExampleBuildersLLC.oneteam.build/proj?projno=1&quickid=TESTTOKEN")}"><strong>View Full Project Details &amp; Files</strong></a></td></tr>
<tr><td><h2>Riverside Middle Entrance Renovation</h2><p>Sampletown, MD 21000 (Sampletown) </p></td></tr>
<tr><td><a href="${wrap("http://ExampleBuildersLLC.oneteam.build/proj?projno=1&quickid=TESTTOKEN&appname=oneTeamPlanTab")}"><strong>View Project Files</strong></a></td></tr>
<tr><td><p>A site visit will be held on November 2 at 9:00 AM at the main entrance.</p></td></tr>
</table>`,
};

export const blueBookAddenda: EmailInput = {
  fromAddress: "OneTeam000001@bbbid.thebluebook.com",
  subject: "Notice of Addenda #:  - Riverside Middle Entrance Renovation (Sampletown, MD)",
  receivedAt: "2026-10-17T15:00:00Z",
  html: "<p>Notice of Addenda</p><p>Bid is due by 5:00 PM (Eastern) on November 6, 2026</p>",
};

export const blueBookSummary: EmailInput = {
  fromAddress: "bbbid@bbbid.thebluebook.com",
  subject: "BidScope Summary - 10/17/26",
  receivedAt: "2026-10-17T06:03:13Z",
  html: "<p>BidScope Daily Project Summary Report</p>",
};

export const bcInviteTwoScopes: EmailInput = {
  fromAddress: "team@buildingconnected.com",
  fromName: "Pat Lee (Sample Contracting Inc)",
  subject: "Bid Invite: County Fire Station #9 Project",
  receivedAt: "2026-10-14T20:00:29Z",
  html: `<p><b>Pat Lee</b> from <b>Sample Contracting, Inc</b> has invited you to bid on</p>
<h4><b>County Fire Station #9</b></h4>
<h5><a href="${wrap("https://app.buildingconnected.com/goto/aaa111")}">View the RFP for Structural Steel »</a></h5>
<h5><a href="${wrap("https://app.buildingconnected.com/goto/bbb222")}">View the RFP for Misc. Metals »</a></h5>
<p><b>Location: </b>100 Example Drive, Sampletown, MD 21000, United States of America</p>`,
};

export const bcInviteOneScope: EmailInput = {
  fromAddress: "team@buildingconnected.com",
  fromName: "Kim Doe (Example Construction)",
  subject: "Bid Invite: Cafe at Lakeside Project",
  receivedAt: "2026-10-15T18:22:46Z",
  html: `<p>Kim Doe from Example Construction has invited you to bid on</p>
<p>Cafe at Lakeside: Decorative ornamental panels</p>
<a href="${wrap("https://app.buildingconnected.com/goto/ccc333")}">View this RFP</a>`,
};

export const bcUpdate: EmailInput = {
  fromAddress: "team@buildingconnected.com",
  subject: "Bid Due Date Extended to 10/20 - County Fire Station #9",
  receivedAt: "2026-09-30T21:51:22Z",
  html: `<p>Pat Lee of Sample Contracting, Inc sent your company a message about</p>
<p>County Fire Station #9: Structural Steel</p><p>Bid Due Date Extended to 10/20</p>`,
};

export const directGcConflict: EmailInput = {
  fromAddress: "invitationtobid@examplegc.com",
  fromName: "invitationtobid@examplegc.com",
  subject: "Bid 9001 - Visitor Center Rehabilitation; Sampleville; MD -bids 11/23@4PM",
  receivedAt: "2026-10-16T15:19:42Z",
  html: `<table><tr><td>INVITATION TO BID </td></tr>
<tr><td>Job Name: </td><td>Visitor Center Rehabilitation </td></tr>
<tr><td>Location: </td><td>1 Park Road, Sampleville, Maryland 20000 </td></tr>
<tr><td>Bid date: </td><td>11/23/2026 at 5:00 P </td></tr>
<tr><td>Direct Link(s) to Files Below</td></tr>
<tr><td><a href="${wrap("https://www.examplegc.com/files/link.cfm?l=ABC")}">Specifications-Combined.pdf</a></td></tr>
<tr><td><a href="${wrap("https://www.examplegc.com/files/link.cfm?l=DEF")}">100 CDs Drawings.pdf</a></td></tr>
<tr><td><a href="${wrap("https://www.examplegc.com/files/link.cfm?l=DEF")}">100 CDs Drawings.pdf</a></td></tr></table>`,
};

export const directGcPipeline: EmailInput = {
  fromAddress: "bids@examplegc2.com",
  fromName: "Example GC Estimating Department",
  subject: "INVITATION TO BID - Transition Academy",
  receivedAt: "2026-10-15T19:31:39Z",
  html: `<div><strong>INVITATION TO BID</strong><br /><strong>Transition Academy</strong><br />
<strong>Bids are due by: November 17, 2026 2:00 PM</strong></div>
<table><tr><td><strong>Project:</strong></td><td>Transition Academy</td></tr>
<tr><td><strong>Address:</strong></td><td>2 School Lane, Sampletown, VA 20000</td></tr>
<tr><td><strong>Scope:</strong></td><td><p>Renovation and addition.<br />There will be a scheduled site visit on Tuesday, October 20, 2026 at 10:00 am. This is the only site visit.</p></td></tr></table>
<p>You are invited to bid on the following: </p><p><strong>051200: Structural Steel Framing</strong></p><p></p>
<a href="${wrap("http://go.example-bidsoftware.com/click?upn=XYZ")}">View Files and Project Details </a>
<table><tr><td>Project ID:</td><td>123456</td></tr><tr><td>Security Key:</td><td>Fake$Key9</td></tr></table>`,
};

export const directGcAddendum: EmailInput = {
  fromAddress: "estimator@examplegc3.com",
  fromName: "Sam Estimator",
  subject: "Addendum #3 - 10 Sample Road",
  receivedAt: "2026-10-16T12:52:51Z",
  text: "All Bidders, Addendum #3. The bid due has been extended to Thursday October 29th.",
};

export const vendorSpam: EmailInput = {
  fromAddress: "sales@example-outsourcing.com",
  fromName: "Sales Rep",
  subject: "Re: Supporting Your Engineering Workflow with Dedicated Resources",
  receivedAt: "2026-10-16T16:44:27Z",
  text: "I wanted to briefly reconnect following my earlier emails.",
};

export const planHubMarketing: EmailInput = {
  fromAddress: "projectnotification@planhubprojects.com",
  subject: "Latest projects in your area ready for bids",
  receivedAt: "2026-10-17T14:47:09Z",
  text: "Unlock full access to view plans, bidders, and contact details",
};

export const planHubInvite: EmailInput = {
  fromAddress: "000001@message.planhub.com",
  fromName: "Alex Bidder",
  subject: "ITB - New Field Office Sampletown, Maryland (Example Construction)",
  receivedAt: "2026-10-12T11:50:00Z",
  html: `<p>You are invited to bid.</p><a href="https://app.planhub.com/project/1">View Project</a>`,
};

export const quarantineDigest: EmailInput = {
  fromAddress: "do-not-reply@proofpointessentials.com",
  subject: "Proofpoint Essentials - Quarantine Digest",
  receivedAt: "2026-10-18T07:05:12Z",
  html: `<table><tr><td>Quarantined (by Score)</td></tr>
<tr><td><b>Alex Bidder &lt;000001@message.planhub.com&gt;</b><br /><a href="mailto:bounces@em0000.planhub.com">bounces@em0000.planhub.com</a></td>
<td>ITB - New Field Office Sampletown, Maryland (Example Construction) </td><td>12 Oct 26 - 11:50 </td><td>Preview</td></tr>
<tr><td><b>Econ News &lt;connect@planhub.com&gt;</b><br /><a href="mailto:x@hubspotemail.net">x@hubspotemail.net</a></td>
<td>Where Construction Is Growing </td><td>02 Oct 26 - 13:54 </td><td>Preview</td></tr>
<tr><td><b>Casey Doe &lt;000002@message.planhub.com&gt;</b><br /><a href="mailto:bounces@em0000.planhub.com">bounces@em0000.planhub.com</a></td>
<td>ITB - Transit Maintenance Facility Sampleville, Maryland (Sample Builders Co) </td><td>07 Oct 26 - 16:21 </td><td>Preview</td></tr></table>`,
};
