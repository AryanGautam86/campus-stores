# Campus Stores

## My submission: partial returns that hand themselves over

**Short version:** issuing a kit works well. A partial return doesn't. The register only records "returned" or "not returned", so the most important fact of the evening ("Leela has the adapter, back at 9") lives in a free-text Desk book note that the morning shift has to find and match to a slip by hand. My change moves that fact onto the slip.

The changes are in `app.js` (Loan register: `checkIn`, `slipRow` and the two new form handlers) and `styles.css`. Issuing works exactly as before.

### What the product handles well: issuing the kit (Fri 3:45 pm)

I issued PR-04, SP-02 and AD-12 to **Kabir Sen** for RQ-214, one slip per unit.

- The projector in repair (PR-06) and the microphone already on loan (MI-09) never appear as options, so I couldn't hand out a broken or double-booked unit.
- When I tried to add a camera to RQ-214, and then a second speaker, the form refused both: the camera isn't on the approved request, and the request covers only one speaker.
- Because every slip names a **physical unit** (AD-12, not "an adapter"), the morning shift can close the right adapter at all, even though AD-12 and AD-15 sit in the same bin, C4.

### What I would change: the partial return and the handover (Fri 7:30 pm → Sat 9:00 am)

At 7:30 pm I closed the projector and speaker slips. For the adapter, the product had nowhere to record what Kabir told me. The slip still read `AD-12 · RQ-214 · Kabir Sen · Due Fri 8 pm`, so my only option was a free-text Desk book note.

At 9 am, taking over from that state, the slip:
- showed the unit ID but not the model;
- named Kabir, not Leela;
- gave no sign it was overdue;
- sat next to the Debate Union microphone, which was also outstanding;
- closed with one click on **Record return**, with no check and no undo.

To close the right slip, the morning person had to put together the Desk book note, the slip and the Inventory page, and then trust their own click.

### The change

1. **Take a return** for a whole request. Choose RQ-214, and every open slip in the kit gets an outcome: **Back at the counter** or **Not returned yet**. Choosing *Not returned yet* asks for **Now with** (a person) and **Expected back** (a time). The check-in can't be saved until every unit has an outcome.
2. **The handover writes itself.** The holder and expected time are stored on the slip. A Desk book entry linked to the slip is added automatically and shows whether that slip is still open or now closed.
3. **Outstanding slips explain themselves.** Each slip shows the type, model and bin, who it was issued to, who has it now, and when it's expected. Slips past their due time against desk time are flagged **Overdue** and sorted to the top.
4. **Closing a slip asks you to check the unit.** **Record return** opens a confirmation instead of closing straight away: "Its label should read AD-12: Belkin AVC002… Not to be confused with AD-15 (Anker A8312, bin C4)". **Returned by** defaults to the current holder. Closed slips record who returned the unit and when.

### The same job with the change

- **Fri 3:45 pm.** Issue PR-04, SP-02 and AD-12 to Kabir, due Fri 8 pm. Nothing changes here.
- **Fri 7:30 pm.** *Take a return → RQ-214*. Mark the projector and speaker *Back*, and the adapter *Not returned yet, now with Leela Das, expected Sat 9 am*. Save. The status reads "Returned PR-04, SP-02. Still out: AD-12 with Leela Das." I don't have to write a note myself.
- **Sat 9:00 am.** Open the Loan register. The top row is `L-404 · AD-12 · USB-C → HDMI adapter · Belkin AVC002 · bin C4 · Now with Leela Das · expected Sat 9 am`, marked **Overdue · due Fri 8 pm**. Leela hands over the adapter. *Record return* asks me to check that the label reads AD-12 and pre-fills "Returned by: Leela Das". *Confirm AD-12 is back* closes it, and only the microphone remains outstanding.

### What I kept

One slip per physical unit, the issue-time checks (approved types, quantity, units in repair or already on loan), the Desk book for genuinely free-form messages, and the existing layout and visual style. The change only adds structure where the product was losing information.

### The observation that would tell me it helped

At a real counter, watch the first return of each morning shift. **Does the staffer close the right slip straight from the Loan register, without first opening the Desk book or Inventory or asking a colleague?** Time how long it takes from the student reaching the counter to the slip being closed. If people still go looking elsewhere, the slip isn't carrying enough. If wrong-unit closes still happen, the label check isn't working.

### How I verified it

I wrote an automated browser test (headless Edge, Playwright) that plays the whole shift. It runs 42 checks: the original issue validations, the check-in refusing incomplete outcomes, the holder and expected time appearing on the slip and in the Desk book, the overdue flag and sort order at 9 am, the confirm step (including Cancel), state surviving a reload, Restart, no horizontal scroll at 375 px, and no console errors.

---

Campus Stores is a Product Engineer work sample set at a fictional campus media equipment desk. Work through a club’s screening, from equipment pickup to a partial return and the next morning’s handover. Open **Candidate brief** in the app for the assignment.

## Run the app

Open `index.html` in a modern browser. The app includes its scripts, styles, and icons and can run offline.

To serve it over local HTTP, run this from the repository folder and visit `http://localhost:8000`.

```sh
python3 -m http.server 8000 --bind 127.0.0.1
```

Each browser stores its own sample shift locally when browser storage is available. **Restart sample shift** restores the fictional starting records.

## Source

- `index.html` contains the desk layout, candidate brief, and bundled icons.
- `app.js` contains the sample records and interactions.
- `styles.css` defines the desktop and mobile layouts.

Icon license notices are in [third-party/lucide-LICENSE.txt](third-party/lucide-LICENSE.txt).


## Submit your work

1. [Fork Campus Stores](https://github.com/virinchi-healthcare/campus-stores/fork) into your GitHub account. Complete the candidate brief and push your changes to your public fork. In your README, point reviewers to your work and explain the decision you made.
2. In your fork, open **Commits**, select the final commit you want reviewed, and copy the page URL. It should look like `https://github.com/YOUR-USERNAME/campus-stores/commit/COMMIT-SHA`.
3. [Submit your work through the Google Form](https://docs.google.com/forms/d/e/1FAIpQLScvzoh1R4WS-SkiwAVBQbMvniieJYSoOEfLMyVo5CyjOvYUgQ/viewform). Your **roll number**, **email ID**, and **final commit link from your public fork** are required. Enter your roll number and email ID in the form only.
