# Thin wrapper to expose the existing extractor under the expected module name
from .analytics_extractor import extract_restaurant_analytics

__all__ = ["extract_restaurant_analytics"]
