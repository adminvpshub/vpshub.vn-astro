import React, { useEffect, useState } from 'react';
import { Check } from 'lucide-react';

interface PricingPlan {
  id: string;
  name: string;
  title: string;
  monthlyPrice: number;
  cpu: string;
  ram: string;
  disk: string;
  traffic: string;
  bandwidth: string;
  backup: string;
  support: string;
  numberOfIps: number;
  isActive: boolean;
}

interface PricingGridProps {
  mostPopularText: string;
  choosePlanText: string;
  currency: string;
  period: string;
  translations: {
    loading: string;
    error: string;
    traffic: string;
    unlimitedTraffic: string;
    bandwidth: string;
    ipAddress: string;
    ipAddresses: string;
  };
}

export default function PricingGrid({
  mostPopularText,
  choosePlanText,
  currency = "VND",
  period = "/month",
  translations
}: PricingGridProps) {
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await fetch('/api/vps');
        if (!response.ok) {
          throw new Error('Failed to fetch pricing plans');
        }
        const data = await response.json();
        setPlans(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20 w-full text-slate-400">
        {translations.loading}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center py-20 w-full text-red-400">
        {translations.error}
      </div>
    );
  }

  return (
    <>
      {plans.map((plan) => {
        const isPopular = plan.name.includes("Standard");

        const features = [
            plan.cpu,
            plan.ram,
            plan.disk,
            plan.traffic === "Unlimited" ? translations.unlimitedTraffic : `${translations.traffic}: ${plan.traffic}`,
            `${translations.bandwidth}: ${plan.bandwidth}`,
            plan.backup,
            `${plan.numberOfIps} ${plan.numberOfIps > 1 ? translations.ipAddresses : translations.ipAddress}`,
            plan.support
        ].filter(Boolean);

        return (
          <div
            key={plan.id}
            className={`relative rounded-2xl border ${isPopular ? 'border-blue-500 bg-slate-800/80' : 'border-white/10 bg-slate-900/50'} p-8 shadow-xl flex flex-col`}
          >
            {isPopular && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-blue-600 px-4 py-1 text-sm font-medium text-white shadow-lg">
                {mostPopularText}
              </div>
            )}
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-white">{plan.name}</h3>
              {plan.title && (
                 <p className="text-sm text-slate-400 mt-1">{plan.title}</p>
              )}
              <div className="mt-4 flex items-baseline">
                <span className="text-4xl font-bold text-white">
                  {plan.monthlyPrice.toLocaleString()}
                </span>
                <span className="ml-1 text-sm font-medium text-slate-400">{currency}</span>
                <span className="text-slate-500">{period}</span>
              </div>
            </div>
            <ul className="mb-8 space-y-4 flex-1">
              {features.map((feature, index) => (
                <li key={index} className="flex items-center text-sm text-slate-300">
                  <Check className="mr-3 h-4 w-4 text-blue-500 flex-shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>
            <a
              href="https://identity.vpshub.vn"
              className={`inline-flex w-full items-center justify-center rounded-lg px-4 py-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-700 ${isPopular ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-slate-800 text-white hover:bg-slate-700 border border-white/10'}`}
            >
              {choosePlanText}
            </a>
          </div>
        );
      })}
    </>
  );
}
