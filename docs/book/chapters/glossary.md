# Glossary (kid-friendly)

Plain-language meanings, with the grown-up word in bold.

| Word | What it means in this book |
|---|---|
| **Agent** | A helper with one job, like a classmate who is only in charge of drawing the map. Ghost AI has eight lead helpers. |
| **Sub-agent / side agent** | A helper's helper. The Frontend helper has one for pixels, one for motion and one for being friendly to everybody. |
| **Orchestrator** | The team captain who hands out jobs and checks that the pieces fit together. |
| **Brief** | A short note saying what you want built, like a wish list. |
| **Stack** | The set of building blocks you choose: the toy bricks of a software project (for example Next.js, Clerk, Postgres). |
| **Pipeline** | An assembly line. Work moves from one helper to the next in order. |
| **API** | A menu a program can order from. "Give me the list of projects" is one item on the menu. |
| **Route** | An address. `/dashboard/tasks` is the address of the task board; `/api/health` is the address that answers "are you OK?". |
| **Endpoint** | One item on the API menu, made of a verb (GET, POST...) and an address. |
| **GET / POST / PATCH / DELETE** | Ask to look, ask to add something new, ask to change a little, ask to throw away. |
| **JSON** | A tidy way of writing information so computers can read it, like a form with labelled boxes. |
| **Schema** | The shape of a form: which boxes exist and what may be written in them. Zod checks forms; Drizzle describes database tables. |
| **Zod** | A bouncer that checks every request has the right boxes filled in the right way. |
| **Database** | A big organised notebook the app writes in so it remembers things after you close it. |
| **SQLite / libSQL** | A notebook that lives in a single file. libSQL is a friendly modern version that can also live on the internet (Turso). |
| **Drizzle** | A translator between the app and the notebook. |
| **Next.js** | The framework that turns files in folders into web pages and API addresses. |
| **React** | The tool that builds pages out of little reusable pieces called components. |
| **Component** | A reusable piece of a page, like a Lego brick: a button, a card, a whole dashboard. |
| **Tailwind** | A way of styling by giving each piece small labels such as "round corners" and "blue". |
| **shadcn/ui** | A starter kit of nice-looking components that you copy into your project and own. |
| **Design token** | A named choice such as "the cyan colour" so the whole app uses the same one. |
| **Clerk** | The doorman: handles sign-in with email or GitHub. |
| **Demo mode** | The app pretends to have a server and keeps its toys in your own browser, so anyone can try it with no account. |
| **Static export** | Turning the whole site into plain files that any web host can hand out, with no program running behind them. |
| **GitHub Pages** | A free place on the internet that hands out those plain files. |
| **CI (continuous integration)** | A robot that runs the checks every time someone proposes a change. |
| **Workflow** | The robot's instruction sheet (a YAML file in `.github/workflows`). |
| **Docker / container** | A lunchbox with the app and everything it needs inside, so it runs the same everywhere. |
| **Dockerfile** | The recipe for packing that lunchbox. |
| **Health check** | Knocking on the door every few seconds to see whether somebody answers. |
| **Playwright** | A robot that opens a real browser and clicks around like a person to see whether things work. |
| **End-to-end (e2e) test** | A test that goes through the whole app the way a user does. |
| **Linter (ESLint)** | A spell-checker for code style and mistakes. |
| **TypeScript / `tsc`** | JavaScript with labels on everything; `tsc` checks all the labels match. |
| **Mermaid** | A way to draw diagrams by writing words. |
| **ADR** | Architecture Decision Record: a diary entry explaining why a big choice was made. |
| **Commit** | A saved snapshot of the project with a note about what changed. |
| **Pull request (PR)** | Asking the team to review your changes before they join the main project. |
| **CodeRabbit** | A robot reviewer that reads pull requests and leaves comments. |
| **CodeQL** | A robot that hunts for security holes in the code. |
| **Dependabot** | A robot that tells you when the building blocks you use have new versions. |
| **Rate limit** | A rule like "no more than 60 requests a minute" so nobody can flood the door. |
| **CORS** | Permission slips telling a browser which other websites may talk to this API. |
| **PPR / Cache Components** | A Next.js trick that serves a ready-made page instantly and fills the changing parts in later; it needs a live server, so it is off for the static demo. |
| **Proxy (Next.js 16)** | A checkpoint that every request passes before reaching a page; it replaces what used to be called middleware. |
| **EPERM** | "Operation not permitted": the computer says some other program is holding the file you want. |
