"""Idempotent seed: creates first admin from env vars and starter content if tables are empty.
Run:  python -m app.seed
"""
from sqlalchemy import select
from app.core.config import get_settings
from app.core.security import hash_password
from app.db.session import SessionLocal
from app.models.models import Project, Service, SiteSetting, Testimonial, User

SERVICES = [
    ("full-stack-web-development", "Full-Stack Web Development", "layers", "End-to-end web applications: polished frontends, robust APIs, secure authentication and a database designed to grow.",
     ["Frontend", "Backend", "APIs", "Authentication", "Database", "Admin dashboards", "Deployment"], 1200, "3-8 weeks"),
    ("business-website-development", "Business Website Development", "briefcase", "Fast, search-friendly websites that present your company clearly and turn visitors into enquiries.",
     ["Corporate websites", "Landing pages", "Company websites", "Contact systems", "CMS", "SEO"], 400, "1-3 weeks"),
    ("e-commerce-development", "E-Commerce Development", "shopping-cart", "Online stores with the catalogue, cart and checkout flow your customers expect, plus tools to run it.",
     ["Product management", "Cart", "Checkout", "Orders", "Payments", "Admin dashboard"], 1500, "4-8 weeks"),
    ("saas-application-development", "SaaS Application Development", "layout-dashboard", "Subscription-ready software products built on a clean multi-user architecture.",
     ["Authentication", "Subscription architecture", "Dashboard", "API", "Database", "User management"], 2500, "6-12 weeks"),
    ("devops-cloud-deployment", "DevOps & Cloud Deployment", "cloud", "Containerised, automated and monitored deployments so releases are boring and reliable.",
     ["Docker", "CI/CD", "AWS", "Railway", "Vercel", "GitHub Actions", "SSL", "Domain configuration"], 300, "3-10 days"),
    ("ai-integration", "AI Integration", "bot", "Practical AI features inside your product or workflow, from assistants to automated pipelines.",
     ["AI chatbots", "AI assistants", "OpenAI integration", "AI agents", "RAG", "AI automation", "n8n workflows"], 800, "2-6 weeks"),
    ("api-backend-development", "API & Backend Development", "server", "Well-documented REST APIs and services with solid data modelling and integrations.",
     ["REST APIs", "FastAPI", "Authentication", "PostgreSQL", "API documentation", "Integrations"], 600, "2-5 weeks"),
    ("deployment-maintenance", "Website Deployment & Maintenance", "wrench", "Get your site live and keep it healthy with monitoring, updates and fixes.",
     ["Production deployment", "Domain", "SSL", "Hosting", "Monitoring", "Bug fixes", "Maintenance"], 150, "1-3 days / monthly"),
]


def case(overview, problem, solution, architecture, process, challenges, results, deployment):
    return dict(overview=overview, problem=problem, solution=solution, architecture=architecture, process=process,
                challenges=challenges, results=results, deployment=deployment)


PROJECTS = [
    ("devtrack", "DevTrack", "SaaS / Project management", "Project management platform for small engineering teams: projects, tasks, boards and a live dashboard.",
     ["Next.js", "FastAPI", "PostgreSQL", "Docker", "Railway", "Vercel"], ["Authentication", "Projects", "Tasks", "Dashboard", "REST API", "Deployment"], True,
     case("DevTrack is a lightweight project tracker for small teams that find larger tools heavy.",
          "Small teams juggle tasks across chat and spreadsheets, so priorities and ownership get lost.",
          "A focused workspace with projects, task boards, assignees and a dashboard that shows what is blocked.",
          "Next.js frontend on Vercel talks to a FastAPI service on Railway backed by PostgreSQL; JWT cookies secure sessions.",
          "Data model first, then API, then UI, with CI running tests and builds on each push.",
          "Keeping board drag-and-drop responsive while persisting order reliably.",
          "Demo project: replace this section with your real outcomes.",
          "Dockerised API, migrations on release, preview deployments for the frontend.")),
    ("ai-career-assistant", "AI Career Assistant", "AI / Career tech", "AI-powered career platform that analyses skills, assists with resumes and recommends next steps.",
     ["Next.js", "Python", "FastAPI", "AI API", "PostgreSQL"], ["AI career suggestions", "Resume assistance", "Skill analysis", "Recommendations"], True,
     case("A guided assistant that turns a user's skills and goals into concrete career suggestions.",
          "Job seekers struggle to see which skills they lack and how to present what they have.",
          "Structured skill intake, AI-generated analysis and tailored resume feedback.",
          "FastAPI orchestrates prompts and validates structured model output before storing it in PostgreSQL.",
          "Prompt design and output schemas first, then UI around the structured results.",
          "Making AI output consistent enough to render as reliable UI.",
          "Demo project: replace this section with your real outcomes.",
          "Containerised API with secrets managed through environment variables.")),
    ("ecommerce-platform", "E-Commerce Platform", "E-commerce", "Full online store with catalogue, cart, checkout, orders and an admin dashboard.",
     ["Next.js", "FastAPI", "PostgreSQL", "Stripe-ready"], ["Products", "Categories", "Cart", "Checkout", "Orders", "Admin dashboard"], False,
     case("A storefront and back office for a small retailer.", "Selling online needs more than a product page: stock, orders and payments must agree.",
          "Catalogue, cart and checkout backed by transactional order handling.", "Server-validated cart totals; admin panel for products and orders.",
          "Built around the order lifecycle.", "Keeping stock accurate under concurrent checkouts.", "Demo project: replace with real outcomes.", "Docker + managed PostgreSQL.")),
    ("real-estate-platform", "Real Estate Platform", "Marketplace", "Property listings with search, filters, agent profiles and an enquiry system.",
     ["Next.js", "FastAPI", "PostgreSQL"], ["Property listings", "Search", "Filters", "Property details", "Agent profiles", "Inquiry system", "Admin dashboard"], False,
     case("A listings site that makes browsing and enquiring simple.", "Buyers need fast filtering and agents need qualified enquiries.",
          "Indexed search with filters, rich property pages and an enquiry inbox.", "Filterable API with database indexes on common search fields.",
          "Search experience first.", "Fast filtering over many listings.", "Demo project: replace with real outcomes.", "Vercel + Railway.")),
    ("restaurant-ordering-platform", "Restaurant Ordering Platform", "Food tech", "Online menu, cart and ordering with customer accounts and a restaurant dashboard.",
     ["Next.js", "FastAPI", "PostgreSQL"], ["Menu", "Cart", "Orders", "Customer accounts", "Restaurant dashboard"], False,
     case("Direct ordering for independent restaurants.", "Third-party apps take large commissions.", "A branded ordering flow with a live order board.",
          "Order state machine with notifications.", "Menu and order flow first.", "Keeping the kitchen view in sync.", "Demo project: replace with real outcomes.", "Docker deployment.")),
    ("ai-lead-qualification", "AI Lead Qualification System", "AI / Automation", "Captures leads, qualifies them with AI and routes them through an automated workflow.",
     ["n8n", "FastAPI", "OpenAI API", "PostgreSQL"], ["Lead capture", "AI qualification", "Automated workflow", "n8n", "Email notifications", "Dashboard"], False,
     case("Automates the first pass of sales qualification.", "Sales teams waste time on unqualified enquiries.", "Leads are scored by AI and routed by workflow.",
          "Webhook intake, scoring service, n8n routing, email alerts.", "Scoring rubric first, workflow second.", "Keeping scoring explainable.",
          "Demo project: replace with real outcomes.", "n8n and API self-hosted via Docker.")),
]

TESTIMONIALS = [
    ("Sample Client", "Example Co.", "Founder", "Demo testimonial: clear communication, fast iterations and a clean deployment. Replace with a real client quote."),
    ("Sample Client", "Example Studio", "Product Manager", "Demo testimonial: the project dashboard made it easy to follow progress. Replace with a real client quote."),
    ("Sample Client", "Example Labs", "CTO", "Demo testimonial: solid architecture and documentation. Replace with a real client quote."),
]

STATS = [{"label": "Projects", "value": "20+"}, {"label": "Technologies", "value": "10+"},
         {"label": "Availability", "value": "24/7"}, {"label": "Commitment", "value": "100%"}]


def run() -> None:
    s = get_settings()
    with SessionLocal() as db:
        if s.admin_email and s.admin_password and not db.scalar(select(User).where(User.role == "admin")):
            db.add(User(email=s.admin_email.lower(), full_name="Abdullah Hayat", role="admin", password_hash=hash_password(s.admin_password)))
            print("Created admin:", s.admin_email)
        if not db.scalar(select(Service.id).limit(1)):
            for i, (slug, title, icon, desc, feats, price, eta) in enumerate(SERVICES):
                db.add(Service(slug=slug, title=title, icon=icon, description=desc, features=feats, starting_price=price,
                               delivery_estimate=eta, image_url=f"/img/services/{slug}.svg", sort_order=i))
        if not db.scalar(select(Project.id).limit(1)):
            for i, (slug, title, cat, summary, tech, feats, featured, cs) in enumerate(PROJECTS):
                db.add(Project(slug=slug, title=title, category=cat, summary=summary, technologies=tech, features=feats,
                               image_url=f"/img/projects/{slug}.svg", gallery=[f"/img/projects/{slug}.svg"], case_study=cs,
                               is_featured=featured, sort_order=i))
        if not db.scalar(select(Testimonial.id).limit(1)):
            for name, company, role, quote in TESTIMONIALS:
                db.add(Testimonial(name=name, company=company, role=role, quote=quote, is_demo=True))
        if not db.get(SiteSetting, "about_stats"):
            db.add(SiteSetting(key="about_stats", value={"items": STATS}))
        db.commit()


if __name__ == "__main__":
    run()
