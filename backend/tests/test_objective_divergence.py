"""Testes da função pura de divergência de objetivos."""

from app.services.objective_divergence import DivergenceStatus, compute_divergence


def test_compute_divergence_ok_with_free() -> None:
    result = compute_divergence(100.0, 60.0)
    assert result.status == DivergenceStatus.OK
    assert result.total == 100.0
    assert result.allocated_explicit == 60.0
    assert result.free == 40.0
    assert result.delta == 0.0


def test_compute_divergence_ok_fully_allocated() -> None:
    result = compute_divergence(100.0, 100.0)
    assert result.status == DivergenceStatus.OK
    assert result.free == 0.0


def test_compute_divergence_over_total() -> None:
    result = compute_divergence(50.0, 100.0)
    assert result.status == DivergenceStatus.OVER_TOTAL
    assert result.delta == -50.0
    assert result.free == -50.0


def test_compute_divergence_invalid_total() -> None:
    result = compute_divergence(None, 10.0)
    assert result.status == DivergenceStatus.INVALID
