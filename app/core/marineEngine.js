const crypto = require('crypto');

/**
 * Marine Charter Telemetry & Route Verification
 * Computes fuel consumption verification and nautical waypoint hashes.
 */

function hashCharterTelemetry(telemetry) {
  const normalized = {
    vesselId: String(telemetry.vesselId || '').toUpperCase(),
    charterId: String(telemetry.charterId || ''),
    durationHours: Number(telemetry.durationHours || 0),
    fuelConsumedLitres: Number(telemetry.fuelConsumedLitres || 0),
    routeWaypointsCount: Number(telemetry.routeWaypointsCount || 0),
    departureMarina: String(telemetry.departureMarina || 'DUBAI_HARBOUR'),
    timestamp: String(telemetry.timestamp || '2026-10-07T00:00:00.000Z')
  };

  const str = JSON.stringify(normalized, Object.keys(normalized).sort());
  return {
    canonical: normalized,
    telemetryHash: crypto.createHash('sha256').update(str).digest('hex')
  };
}

class MarineEscrow {
  constructor(charterId, baseCharterAed, fuelDepositAed) {
    this.charterId = String(charterId);
    this.baseCharterAed = Number(baseCharterAed);
    this.fuelDepositAed = Number(fuelDepositAed);
    this.totalHeldAed = this.baseCharterAed + this.fuelDepositAed;
    this.status = 'HELD';
    this.fuelSettledAed = 0;
    this.fuelRefundedAed = Number(fuelDepositAed);
  }

  settleCharter(actualFuelCostAed, telemetryHash) {
    const cost = Math.min(this.fuelDepositAed, Math.max(0, Number(actualFuelCostAed)));
    this.fuelSettledAed = cost;
    this.fuelRefundedAed = this.fuelDepositAed - cost;
    this.status = 'SETTLED';

    const proof = crypto.createHash('sha256')
      .update(`${this.charterId}:${this.totalHeldAed}:${this.fuelSettledAed}:${this.fuelRefundedAed}:${telemetryHash}`)
      .digest('hex');

    return {
      charterId: this.charterId,
      status: this.status,
      baseCharterAed: this.baseCharterAed,
      fuelSettledAed: this.fuelSettledAed,
      fuelRefundedAed: this.fuelRefundedAed,
      settlementProof: proof
    };
  }

  verifyConservation() {
    return this.fuelDepositAed === (this.fuelSettledAed + this.fuelRefundedAed);
  }
}

module.exports = {
  hashCharterTelemetry,
  MarineEscrow
};
