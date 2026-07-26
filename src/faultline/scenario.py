"""A compact but realistic production ML lineage scenario."""

from __future__ import annotations

from datetime import UTC, datetime

from .gateway import MemoryDataHubGateway
from .models import Asset, ChangeKind, ChangeSignal

RAW = "urn:li:dataset:(urn:li:dataPlatform:snowflake,retail.raw_orders,PROD)"
FEATURE_TABLE = "urn:li:dataset:(urn:li:dataPlatform:feast,retail.order_features,PROD)"
FEATURE = "urn:li:mlFeature:(retail.order_features,customer_lifetime_value)"
MODEL = "urn:li:mlModel:(urn:li:dataPlatform:mlflow,churn-predictor,PROD)"
DEPLOYMENT = "urn:li:mlModelDeployment:(churn-predictor,blue,PROD)"
DASHBOARD = "urn:li:dashboard:(looker,churn-command-center)"


def retail_churn_scenario() -> tuple[MemoryDataHubGateway, ChangeSignal]:
    assets = [
        Asset(RAW, "raw_orders", "DATASET", "snowflake", "data-platform", 2),
        Asset(
            FEATURE_TABLE,
            "order_features",
            "DATASET",
            "feast",
            "ml-platform",
            3,
        ),
        Asset(
            FEATURE,
            "customer_lifetime_value",
            "MLFEATURE",
            "feast",
            "ml-platform",
            3,
        ),
        Asset(MODEL, "churn-predictor", "MLMODEL", "mlflow", "retention-ml", 3),
        Asset(
            DEPLOYMENT,
            "churn-predictor-blue",
            "MLMODEL_DEPLOYMENT",
            "kubernetes",
            "retention-ml",
            3,
        ),
        Asset(
            DASHBOARD,
            "Churn Command Center",
            "DASHBOARD",
            "looker",
            "growth-analytics",
            2,
        ),
    ]
    edges = [
        (RAW, FEATURE_TABLE),
        (FEATURE_TABLE, FEATURE),
        (FEATURE, MODEL),
        (MODEL, DEPLOYMENT),
        (FEATURE_TABLE, DASHBOARD),
    ]
    field_paths = {
        (RAW, FEATURE_TABLE): "order_total",
        (FEATURE_TABLE, FEATURE): "order_total",
        (FEATURE, MODEL): "order_total",
    }
    signal = ChangeSignal(
        source_urn=RAW,
        kind=ChangeKind.TYPE_CHANGED,
        field="order_total",
        before="DECIMAL(18,2)",
        after="VARCHAR",
        observed_at=datetime(2026, 7, 26, 9, 41, 17, tzinfo=UTC),
    )
    return MemoryDataHubGateway(assets, edges, field_paths), signal
