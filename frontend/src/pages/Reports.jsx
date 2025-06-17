import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext'; // Importing language context
import '../styles.css'; // Assuming your styles are here
import { Bar, Scatter, Line } from 'react-chartjs-2'; // Added Line
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend, TimeScale, Filler } from 'chart.js'; // Added TimeScale and Filler
import 'chartjs-adapter-date-fns'; // Import date adapter

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend, TimeScale, Filler); // Added TimeScale and Filler

const Reports = () => {
  const { token } = useAuth();
  const { t } = useLanguage(); // Get translation function
  const [spendingPrediction, setSpendingPrediction] = useState(null);
  const [anomalyDetection, setAnomalyDetection] = useState(null);
  const [budgetOptimization, setBudgetOptimization] = useState(null);
  const [behavioralNudges, setBehavioralNudges] = useState(null);
  const [benchmarking, setBenchmarking] = useState(null);

  const [loading, setLoading] = useState({
    spending: true,
    anomaly: true,
    optimization: true,
    nudges: true,
    benchmarking: true,
  });
  const [error, setError] = useState({
    spending: null,
    anomaly: null,
    optimization: null,
    nudges: null,
    benchmarking: null,
  });

  const fetchData = async (endpoint, setData, section) => {
    setLoading(prev => ({ ...prev, [section]: true }));
    setError(prev => ({ ...prev, [section]: null }));
    try {
      const response = await fetch(`/api/predictions/${endpoint}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      // Check content type before parsing
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.indexOf("application/json") !== -1) {
        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.message || `Failed to fetch ${section} data (status: ${response.status})`);
        }
        const data = await response.json();
        setData(data);
      } else {
        // Handle non-JSON responses
        const textResponse = await response.text();
        console.error(`Non-JSON response for ${section}:`, textResponse);
        throw new Error(`Received non-JSON response from server for ${section}. Status: ${response.status}. See console for details.`);
      }

    } catch (err) {
      console.error(`Error fetching ${section}:`, err); // Log the full error object
      setError(prev => ({ ...prev, [section]: err.message }));
    } finally {
      setLoading(prev => ({ ...prev, [section]: false }));
    }
  };

  useEffect(() => {
    if (token) {
      fetchData('spending', setSpendingPrediction, 'spending');
      fetchData('anomaly-detection', setAnomalyDetection, 'anomaly');
      fetchData('budget-optimization', setBudgetOptimization, 'optimization');
      fetchData('behavioral-nudges', setBehavioralNudges, 'nudges');
      fetchData('benchmarking', setBenchmarking, 'benchmarking');
    }
  }, [token]);

  // Chart data for Spending Prediction
  const spendingChartData = spendingPrediction?.chartData ? {
    labels: spendingPrediction.chartData.labels,
    datasets: spendingPrediction.chartData.datasets.map(ds => ({
      ...ds,
      // Ensure fill is correctly interpreted if it's a string like '+1' or '-1'
      // For confidence intervals, Chart.js might need specific fill options
      // Example: if ds.label contains 'Lower Bound' or 'Upper Bound'
      fill: ds.label && (ds.label.includes('Lower Bound') || ds.label.includes('Upper Bound')) ? (ds.label.includes('Upper Bound') ? '-1' : '+1') : false,
      pointRadius: ds.label && (ds.label.includes('Lower Bound') || ds.label.includes('Upper Bound')) ? 0 : undefined, // Hide points for CI
      borderDash: ds.label && (ds.label.includes('Lower Bound') || ds.label.includes('Upper Bound')) ? [5, 5] : undefined, // Dashed line for CI
    }))
  } : { labels: [], datasets: [] };


  const spendingChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: t('spendingForecastChartTitle'), // Updated title
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += formatCurrency(context.parsed.y);
            }
            return label;
          }
        }
      }
    },
    scales: {
      x: {
        type: 'time',
        time: {
          unit: 'day',
          tooltipFormat: 'MMM dd, yyyy',
          displayFormats: {
            day: 'MMM dd'
          }
        },
        title: {
          display: true,
          text: t('date'),
        }
      },
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: t('amountCurrency', {currency: 'USD'}),
        },
        ticks: {
          callback: function(value) {
            return formatCurrency(value, 'USD', true); // Pass true for compact formatting if needed
          }
        }
      }
    }
  };

  // Helper function to format currency (you might want to move this to a utils file)
  // Modified to accept a 'compact' argument for y-axis ticks if needed
  const formatCurrency = (amount, currency = 'USD', compact = false) => {
    if (compact) {
      // Basic compact formatting, can be expanded
      if (amount >= 1000000) return (amount / 1000000).toFixed(1) + 'M';
      if (amount >= 1000) return (amount / 1000).toFixed(1) + 'K';
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency, minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount).replace(/\\$/,''); // Simpler for ticks
    }
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency }).format(amount);
  };

  // Chart data for Anomaly Detection
  const anomalyChartData = {
    datasets: [
      {
        label: 'Anomalous Spending',
        data: anomalyDetection?.anomalies
          ?.filter(a => a.type !== 'habit_change') // Filter out habit_change for this chart
          .map(anomaly => ({
            x: new Date(anomaly.date).getTime(), // Use timestamp for x-axis for time-series data
            y: anomaly.amount,
            r: anomaly.severity || 5 // Add a radius for bubble chart effect, default if no severity
          })) || [],
        backgroundColor: 'rgba(255, 99, 132, 0.5)', // Red for anomalies
        borderColor: 'rgba(255, 99, 132, 1)',
      }
    ]
  };

  const anomalyChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Spending Anomalies Over Time',
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += formatCurrency(context.parsed.y);
            }
            const originalData = anomalyDetection?.anomalies?.find(a => new Date(a.date).getTime() === context.parsed.x && a.amount === context.parsed.y);
            if (originalData) {
              label += ` (Category: ${originalData.category}, Reason: ${originalData.reason || 'N/A'})`;
            }
            return label;
          }
        }
      }
    },
    scales: {
      x: {
        type: 'linear', // Using linear scale for time for simplicity with scatter
        position: 'bottom',
        title: {
          display: true,
          text: 'Date'
        },
        ticks: {
          callback: function(value, index, values) {
            return new Date(value).toLocaleDateString(); // Format timestamp back to date string
          }
        }
      },
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Amount (USD)'
        }
      }
    }
  };


  // Chart data for Budget Optimization
  const budgetOptimizationChartData = {
    labels: budgetOptimization?.optimizations?.filter(opt => opt.category !== "Overall").map(opt => opt.category) || [],
    datasets: [
      {
        label: 'Current Spending',
        data: budgetOptimization?.optimizations?.filter(opt => opt.category !== "Overall").map(opt => opt.currentSpending) || [],
        backgroundColor: 'rgba(255, 159, 64, 0.2)',
        borderColor: 'rgba(255, 159, 64, 1)',
        borderWidth: 1,
      },
      {
        label: 'Suggested Budget',
        data: budgetOptimization?.optimizations?.filter(opt => opt.category !== "Overall").map(opt => opt.suggestedBudget) || [],
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  };

  const budgetOptimizationChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Budget Optimization: Current vs. Suggested',
      },
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };

  // Chart data for Benchmarking
  const benchmarkingChartData = {
    labels: benchmarking?.benchmarks?.map(b => b.category) || [],
    datasets: [
      {
        label: 'Your Spending',
        data: benchmarking?.benchmarks?.map(b => parseFloat(b.yourSpending.replace(/[^\d.-]/g, ''))) || [], // Ensure data is numerical
        backgroundColor: 'rgba(153, 102, 255, 0.2)',
        borderColor: 'rgba(153, 102, 255, 1)',
        borderWidth: 1,
      },
      {
        label: 'Peer Average',
        data: benchmarking?.benchmarks?.map(b => parseFloat(b.peerAverage.replace(/[^\d.-]/g, ''))) || [], // Ensure data is numerical
        backgroundColor: 'rgba(255, 206, 86, 0.2)',
        borderColor: 'rgba(255, 206, 86, 1)',
        borderWidth: 1,
      },
    ],
  };

  const benchmarkingChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Benchmarking: Your Spending vs. Peer Average',
      },
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };


  return (
    <div className="reports-container">
      <h1>{t('reports')}</h1>

      {/* Spending Prediction Section */}
      <section className="report-section">
        <h2>{t('predictiveSpendingAnalysis')}</h2>
        {loading.spending && <p>{t('loadingSpendingPredictions')}</p>}
        {error.spending && <p className="error-message">Error: {error.spending}</p>}
        {spendingPrediction && !loading.spending && !error.spending && (
          <div className="prediction-content">
            <p>{spendingPrediction.message}</p>
            {spendingPrediction.predictedTotalNextMonth !== null ? (
              <>
                <p><strong>{t('predictedTotalSpendingNextMonth')}:</strong> {formatCurrency(spendingPrediction.predictedTotalNextMonth)}</p>
                <p><strong>{t('predictedCashFlowNext30Days')}:</strong> {formatCurrency(spendingPrediction.predictedCashFlowNext30Days)}</p>
                {spendingPrediction.warningDate && (
                  <p className="warning-message"><strong>{t('potentialOverdraftWarning')}:</strong> {new Date(spendingPrediction.warningDate).toLocaleDateString()}</p>
                )}
                {spendingPrediction.chartData && spendingPrediction.chartData.labels && spendingPrediction.chartData.labels.length > 0 ? (
                  <div className="chart-container" style={{ height: '400px', maxWidth: '800px', margin: '20px auto' }}>
                    <Line data={spendingChartData} options={spendingChartOptions} />
                  </div>
                ) : (
                  <p>{t('notEnoughDataForChart')}</p>
                )}
              </>
            ) : (
              <p>{t('notEnoughDataForPrediction')}</p>
            )}
          </div>
        )}
      </section>

      {/* Anomaly Detection Section */}
      <section className="report-section">
        <h2>{t('anomalyDetection')}</h2>
        {loading.anomaly && <p>Loading anomaly detection data...</p>}
        {error.anomaly && <p className="error-message">Error: {error.anomaly}</p>}
        {anomalyDetection && !loading.anomaly && !error.anomaly && (
          <div className="anomaly-content">
            <p>{anomalyDetection.message}</p>
            {anomalyDetection.anomalies && anomalyDetection.anomalies.length > 0 ? (
              <>
                <ul>
                  {anomalyDetection.anomalies.map((anomaly, index) => (
                    <li key={anomaly.id || index} className="anomaly-item">
                      {anomaly.type === 'habit_change' ? (
                        <>
                          <strong>Habit Change Detected:</strong> {anomaly.description}
                          {anomaly.suggestion && <p><em>Suggestion: {anomaly.suggestion}</em></p>}
                        </>
                      ) : (
                        <>
                          <strong>Potential Anomaly:</strong> Spending of {formatCurrency(anomaly.amount)} on {new Date(anomaly.date).toLocaleDateString()} in '{anomaly.category}'.
                          {anomaly.reason && <p><em>Reason: {anomaly.reason}</em></p>}
                          {anomaly.suggestion && <p><em>Suggestion: {anomaly.suggestion}</em></p>}
                        </>
                      )}
                    </li>
                  ))}
                </ul>
                {anomalyDetection.anomalies?.filter(a => a.type !== 'habit_change').length > 0 && (
                  <div className="chart-container" style={{ maxWidth: '700px', margin: '20px auto' }}>
                    <Scatter data={anomalyChartData} options={anomalyChartOptions} />
                  </div>
                )}
              </>
            ) : (
              <p>No significant anomalies detected in your recent spending.</p>
            )}
          </div>
        )}
      </section>

      {/* Budget Optimization Section */}
      <section className="report-section">
        <h2>{t('personalizedBudgetOptimization')}</h2>
        {loading.optimization && <p>Loading budget optimization suggestions...</p>}
        {error.optimization && <p className="error-message">Error: {error.optimization}</p>}
        {budgetOptimization && !loading.optimization && !error.optimization && (
          <div className="optimization-content">
            <p>{budgetOptimization.message}</p>
            {budgetOptimization.optimizations && budgetOptimization.optimizations.length > 0 ? (
              <>
                <ul>
                  {budgetOptimization.optimizations.map((opt, index) => (
                    <li key={index} className="optimization-item">
                      {opt.category !== "Overall" ? (
                       <>
                          <strong>Category: {opt.category}</strong>
                          <p>Current Spending (simulated): {formatCurrency(opt.currentSpending)}</p>
                          <p>Suggested Budget: {formatCurrency(opt.suggestedBudget)}</p>
                          <p>Potential Savings: {formatCurrency(opt.potentialSavings)}</p>
                          {opt.advice && <p><em>Advice: {opt.advice}</em></p>}
                       </>
                      ) : (
                           <p><strong>{opt.category} Advice:</strong> {opt.advice} {opt.potentialSavings && `(Potential Savings: ${formatCurrency(opt.potentialSavings)})`}</p>
                      )}
                    </li>
                  ))}
                </ul>
                {budgetOptimization.optimizations?.filter(opt => opt.category !== "Overall").length > 0 && (
                  <div className="chart-container" style={{ maxWidth: '700px', margin: '20px auto' }}>
                    <Bar data={budgetOptimizationChartData} options={budgetOptimizationChartOptions} />
                  </div>
                )}
              </>
            ) : (
              <p>No specific optimization suggestions available at the moment.</p>
            )}
          </div>
        )}
      </section>

      {/* Behavioral Nudges Section */}
      <section className="report-section">
        <h2>{t('financialBehavioralNudges')}</h2>
        {loading.nudges && <p>Loading behavioral nudges...</p>}
        {error.nudges && <p className="error-message">Error: {error.nudges}</p>}
        {behavioralNudges && !loading.nudges && !error.nudges && (
          <div className="nudges-content">
            <p>{behavioralNudges.message}</p>
            {behavioralNudges.nudges && behavioralNudges.nudges.length > 0 ? (
              <ul>
                {behavioralNudges.nudges.map((nudge) => (
                  <li key={nudge.id} className="nudge-item">
                    <strong>{nudge.type.replace(/_/g, ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}:</strong> {nudge.message}
                    {nudge.suggestion && <p><em>Suggestion: {nudge.suggestion}</em></p>}
                  </li>
                ))}
              </ul>
            ) : (
              <p>No behavioral nudges for you right now.</p>
            )}
          </div>
        )}
      </section>

      {/* Benchmarking Section */}
      <section className="report-section">
        <h2>{t('anonymousBenchmarking')}</h2>
        {loading.benchmarking && <p>Loading benchmarking data...</p>}
        {error.benchmarking && <p className="error-message">Error: {error.benchmarking}</p>}
        {benchmarking && !loading.benchmarking && !error.benchmarking && (
          <div className="benchmarking-content">
            <p>{benchmarking.message}</p>
            {benchmarking.benchmarks && benchmarking.benchmarks.length > 0 ? (
              <>
                <ul>
                  {benchmarking.benchmarks.map((benchmark, index) => (
                    <li key={index} className="benchmark-item">
                      <strong>Category: {benchmark.category}</strong>
                      <p>Your Spending/Rate: {benchmark.yourSpending}</p>
                      <p>Peer Average: {benchmark.peerAverage}</p>
                      {benchmark.insight && <p><em>Insight: {benchmark.insight}</em></p>}
                    </li>
                  ))}
                </ul>
                <div className="chart-container" style={{ maxWidth: '700px', margin: '20px auto' }}>
                  <Bar data={benchmarkingChartData} options={benchmarkingChartOptions} />
                </div>
              </>
            ) : (
              <p>Benchmarking data is currently unavailable.</p>
            )}
          </div>
        )}
      </section>
    </div>
  );
};

export default Reports;