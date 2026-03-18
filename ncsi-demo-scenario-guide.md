### NCSI SMART Portal – Short Demo Scenario Guide


---

## Part 1 – Persona configuration & “Smart” experience

**1. Live persona configuration (Admin) – Economic Analyst & Student**
- Click `Admin` → `Persona configuration`.
- Edit **Persona 1**: set Language = English, Role = Economic Analyst, Region = Muscat, Interests = International trade, Balance of Payments, Macroeconomic indicators → `Save persona`.
- Edit **Persona 2**: set Language = English, Role = University Student, Region = Salalah, Interests = Social trends, Education, Labour market → `Save persona`.
- Go to `Home`, use `View as` in top bar to switch between the two personas and call out changes in hero and recommendations.
- Also try: Add a third persona (e.g., Policy Maker in Dhofar) with its own interests to show scalability.

**2. Dynamic UX by persona (Home, Datasets, AI Assistant)**
- Set `View as` = **Economic Analyst**.
- On `Home`, scroll hero + `Featured / Recommended` and highlight trade / macro content.
- Open `Datasets` and point to trade / macro datasets surfacing at the top.
- Open `AI Assistant`, click a chip like “How is Oman's economy performing lately? I want to know if it's a good time to invest” and show persona‑aware answer.
- Switch `View as` = **University Student** and repeat Home, `Datasets`, and `AI Assistant` to show more social / youth oriented content.
- Also try: Quickly toggle personas while staying on `Datasets` to show the personalized ordering changing live.

**3. Contextual awareness – Event 1: US Tariff change**
- With `View as` = Economic Analyst, open `Event simulator` in the top bar.
- Select **US Tariff change** and apply.
- On `Home`, show the trade‑focused contextual banner and read its key sentence.
- Click the banner CTA (e.g., “View trade & BoP data”) to open `Datasets` with trade highlighted.
- On `Datasets`, show the trade / Balance of Payments datasets near the top and any “Relevant to event” style chips.
- Also try: Clear the event and re‑apply it to show how the experience switches back and forth.

**4. Contextual awareness – Event 2: National Census released**
- Set `View as` = University Student.
- Open `Event simulator`, select **National Census released**, apply.
- On `Home`, show the new census banner and CTA (e.g., “View census data”).
- Click the CTA to go to `Datasets` with census highlighted.
- Point out demographic / census datasets surfaced at the top for this persona.
- Also try: Switch between Event 1 and Event 2 while keeping the University Student persona to show different event‑driven experiences for same user.

**5. Smart discovery – Datasets + AI search**
- In `Datasets`, search for **“trade”** (for Event 1) or **“census” / “population”** (for Event 2) and click `Search`.
- Click `Preview` on one relevant dataset to show the table preview, AI insight summary, and `Download CSV`.
- Open `Search` from the top bar, type a natural query like “impact of US tariff change on Oman trade” or “latest census data for youth in Salalah”.
- Click `Search`, then show the AI summary card and click one result to navigate to its page.
- Also try: Use a very short keyword query (“GDP”) vs a long natural‑language question and compare how the AI summary still gives context.

**6. Smart experience – AI Assistant over data (Chatbot Scenarios)**
- Open `AI Assistant` from the top bar.
- **Map Scenario:** Type: “Show me a map of Oman by governorate to see where the population is most concentrated.” → Show interactive map with data summary (Muscat: 1.45M, Al Batinah North: 0.73M, Dhofar & Al Dakhiliyah: 0.42M each). Use follow-up: “Show population density map” or “Show regional economic indicators for Muscat.”
- **Scenario 1 – Economy:** Type: “How is Oman’s economy performing lately? I want to know if it’s a good time to invest.” → Show GDP, FDI, investment sources, sector diversification. Follow-up: “Which sectors are currently prohibited for foreign investment?” → Show FCIL restrictions, 123 activities.
- **Scenario 2 – Tourism:** Type: “I’m looking to expand my tour agency’s offerings. What are the current tourism trends in Oman, and where are most visitors coming from?” → Show arrivals, top nationalities (UAE, India, Yemen), GCC share.
- **Scenario 3 – Infrastructure:** Type: “I am evaluating locations for a new logistics hub. Which regions have the highest population concentration and the most active transportation networks?” → Show population centers, vehicle activity, aviation hubs.
- **Scenario 4 – Energy:** Type: “What does the data say about industrial energy consumption in Oman? I want to understand the demand for natural gas in the manufacturing sector.” → Show natural gas demand, power generation, refinery output.
- Optionally click the microphone icon, say a query aloud, and send; show the result as a voice‑driven interaction.

---

## Part 2 – Collaborative report authoring & publishing

**7. Maker–Checker collaborative workspace**
- Open `Reports` → click `+ Create report`.
- In the prompt box, type: “Labour market trends in Oman 2020–2024, focusing on youth unemployment and regional differences.”
- Click `AI generate` and, once complete, scroll through title, executive summary, findings, charts, and tables.
- In the Maker–Checker strip, set `Editing as` = Data Analyst and explain this is the **Maker** view.
- Also try: Create a second, shorter report with a different prompt (e.g., “Trade performance of Oman and GCC partners 2019–2024”) to show multiple drafts in the list.

**8. AI‑assisted content creation & editing**
- Select a paragraph and click `Paraphrase` to show clearer wording.
- Select another paragraph and click `Grammar check` (or `Spell check`) to show corrections.
- Open the AI prompt dock, type: “Change the unemployment chart to a line chart from 2020 to 2024, one line per governorate.” and apply.
- Scroll to the chart section and show that the visualization has been updated based on the prompt.
- Also show `Regenerate` on a section to produce an alternate wording.
- Insert a **new** section (text or chart) and use AI to fill it from a short prompt like “Add a key findings section focused on youth in Salalah.”

**9. Review & collaboration (Checker)**
- In the same report, change `Editing as` = Senior Researcher to represent the **Checker**.
- Open the `Comments` panel.
- Select a section, add a comment such as “Please clarify the methodology for youth unemployment between 2020 and 2024.” and post it.
- Then resolve the comment to show the review lifecycle.
- Point to avatars / “Locked by …” indicators on sections and explain simulated co‑editing and presence.
- Also try: Add a second comment marked as a question (e.g., “Can we add a chart comparing Muscat vs Dhofar?”) and leave it unresolved to show open discussion items.

**10. Publish and export the final report**
- In the report header, click `Publish` and confirm.
- Back on `Reports`, switch to the `Published` tab and show the new report listed.
- Reopen the report, click `Export` → `PDF` and mention the one‑click export to PDF (optionally also `PPTX`).
- Also try: From the `Published` list, open an older report to show that the same tools apply to existing content (view, export, share).

---
