# Routes package
from app.routes.health import health_bp
from app.routes.datasets import datasets_bp
from app.routes.dashboards import dashboards_bp
from app.routes.analytics import analytics_bp

__all__ = ["health_bp", "datasets_bp", "dashboards_bp", "analytics_bp"]
