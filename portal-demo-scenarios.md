### Portal demo scenarios (short script)

#### Auth & personalization

**1. New user registers and completes onboarding**  
- Open `Register` (`/register`) from the top bar.  
- Fill name, email, password and click `Continue`.  
- On `Onboarding`, pick language, role, region, interests.  
- Click `Start my personalized experience` → land on Home.  

**2. Returning user logs in to a tailored home**  
- Click `Login` from the top bar.  
- Enter email/password and submit.  
- On Home, point out greeting and role-aware hero.  
- Scroll to `Featured` / `Recommended for you` and link to their persona.  

#### Persona & contextual awareness

**3. Admin configures personas and uses “View as”**  
- Go to `Admin → Persona configuration` (`/admin/personas`).  
- Edit role/region/interests for two personas, click `Save persona`.  
- Return to Home and change `View as` persona in the top bar.  
- Show how hero and recommendations change between personas.  

**4. Event: US Tariff change → trade data focus**  
- In the top bar, pick an analyst persona via `View as`.  
- Open `Event simulator` and select **US Tariff change**.  
- On Home, highlight the new trade-focused banner and CTA.  
- Click CTA → `Datasets` with trade highlighted; show sorted trade datasets.  

**5. Event: National Census released → census focus**  
- In `Event simulator`, choose **National Census released**.  
- On Home, show the census-focused banner and wording.  
- Click CTA → `Datasets` with census highlighted.  
- Point out demographics/census datasets surfaced and “Relevant to event” chips.  

#### Datasets & indicators

**6. Explore datasets with personalization and AI preview**  
- Navigate to `Datasets` from the top bar.  
- Type a keyword in search and click `Search`.  
- Explain `Personalized for you` ordering based on onboarding interests.  
- Click `Preview` on a dataset to open the AI-powered preview modal.  
- Show the table preview, AI insight area, and `Download CSV`.  

**7. Submit a new indicator request**  
- On `Datasets`, click `+ Add indicator`.  
- Fill indicator name, description, category, unit, source.  
- Click `Submit`.  
- Back on `Datasets`, highlight the “Indicator request submitted” banner.  

#### Search & discovery

**8. AI-enhanced portal search**  
- Open `Search` from the top bar.  
- Enter a natural-language query (e.g., “jobs in Muscat”).  
- Click `Search`; show the AI search strip and result count.  
- Read the AI summary and suggested searches.  
- Click a result to navigate to its dataset/report page.  

#### AI Assistant (Chatbot Scenarios)

**9. Map Scenario – National Population Distribution**  
- Go to `AI Assistant` from the top bar.  
- Type or click chip: “Show me a map of Oman by governorate to see where the population is most concentrated.”  
- Show the interactive map with data summary: Muscat: 1.45M, Al Batinah North: 0.73M, Dhofar & Al Dakhiliyah: 0.42M each.  
- Use follow-ups: “Show population density map” or “Show regional economic indicators for Muscat.”  

**10. Scenario 1 – Economy & Investment**  
- Type: “How is Oman’s economy performing lately? I want to know if it’s a good time to invest.”  
- Show GDP, FDI (30.04B OMR), investment sources (UK, US, Kuwait), non-oil sector growth.  
- Follow-up: “Which sectors are currently prohibited for foreign investment?” → FCIL, 123 restricted activities.  

**11. Scenario 2 – Tourism Trends**  
- Type: “I’m looking to expand my tour agency’s offerings. What are the current tourism trends in Oman, and where are most visitors coming from?”  
- Show 3.89M visitors, top nationalities (UAE, India, Yemen), GCC 56% in peak months.  

**12. Scenario 3 – Regional Infrastructure**  
- Type: “I am evaluating locations for a new logistics hub. Which regions have the highest population concentration and the most active transportation networks?”  
- Show population centers, vehicle activity, aviation hubs (Muscat, Salalah).  

**13. Scenario 4 – Industrial Energy**  
- Type: “What does the data say about industrial energy consumption in Oman? I want to understand the demand for natural gas in the manufacturing sector.”  
- Show industrial natural gas demand, power generation, refinery output.  

**14. Use voice input with AI Assistant**  
- In the assistant input, click the microphone icon.  
- Speak a short query (e.g., “Show population by governorate”).  
- Stop recording and send the transcribed query.  
- Show the resulting map/table answer.  

#### My Queries

**15. Manage saved queries and view results**  
- Navigate to `My queries`.  
- Point out saved query name, text, dates.  
- Click `Run` to open the result modal and show the table.  
- Click `Edit` to change query text, then `Save`.  
- Use `Delete` for one query; click `+ New query` to jump to AI Assistant.  

#### Reports & collaboration

**16. Create an AI-generated report and publish**  
- Open `Reports` and click `+ Create report`.  
- In Report Builder, point to Maker–Checker banner and role selector.  
- Click `AI generate`, enter a prompt (e.g., “Labour market trends in Oman 2020–2024”), and generate.  
- Scroll through sections (summary, findings, charts, tables).  
- Click `Publish` and then show the report under `Published`.  

**17. Maker–Checker collaboration with comments and AI tools**  
- From `Reports`, open an existing draft.  
- Switch `Editing as` between roles (e.g., Analyst vs Senior Reviewer).  
- Select a paragraph and use `Paraphrase` or `Grammar check`.  
- Open the Comments panel, add a comment on a section, then resolve it.  

**18. Adjust charts via prompt and export**  
- In a report with charts, open the AI prompt dock.  
- Type a chart instruction (e.g., “Change to line chart for unemployment 2020–2024”) and apply.  
- Show the updated chart section.  
- Use `Export` → choose `PDF` or `PPTX` and show the download.  

**19. Share a report and explain co‑edit presence**  
- In Report Builder, click `Share` and copy the link.  
- Explain how a second user opening the link would appear as an avatar.  
- Point to presence avatars and “Locked by …” indicators on sections.  

#### Help & support

**20. Use Help and AI Assistant for support**  
- Open `Help & support` from the top bar.  
- Skim 2–3 FAQs (downloads, AI assistant, data sources/licensing).  
- Click `Chat with AI Assistant` to open the assistant.  
- Ask a “how do I…” style question to show self‑service help.  

---

### Notable integrations to call out during demo

- **Data sources**: Mention that datasets mirror structures from `ncsi.gov.om`, `data.gov.om`, `data.ncsi.gov.om`, `portal.ecensus.gov.om` (mocked in this PoC).  
- **Maps**: AI answers can render an interactive Oman map for geospatial insights.  
- **Exports**: Reports export to **PDF** and **PPTX** via built-in export tools.  
- **Downloads**: Dataset pages support CSV downloads for offline analysis.  
- **Persistence**: Saved reports, queries, alerts, and AI history use local storage to simulate real persistence and collaboration.  

