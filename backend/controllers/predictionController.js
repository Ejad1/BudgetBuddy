const Expense = require('../models/Expense');
const User = require('../models/User');
const Category = require('../models/Category'); // Added Category model import
const fs = require('fs');
const path = require('path');
const { executePythonScript, createTempDataFile, deleteTempFile } = require('../utils/pythonExecutor');

// Helper function to read and parse the sample data
const getSampleExpenses = () => {
  const filePath = path.join(__dirname, '..', 'dev-data', 'sampleTwoMonthExpenses.json');
  const jsonData = fs.readFileSync(filePath);
  return JSON.parse(jsonData);
};

// @desc    Get spending predictions for the current user
// @route   GET /api/predictions/spending
// @access  Private
const getSpendingPrediction = async (req, res, next) => {
  try {
    const userId = req.user.id; // Keep for future real data use
    const allExpenses = getSampleExpenses();

    // Filter expenses for "sample_user_id_for_chart_data"
    const userExpenses = allExpenses.filter(e => e.user === "sample_user_id_for_chart_data");

    if (!userExpenses || userExpenses.length === 0) {
      return res.json({
        message: "Pas assez de données de dépenses pour générer une prédiction.",
        predictedTotalNextMonth: null,
        predictedCashFlowNext30Days: null,
        warningDate: null,
        daily_forecast: []
      });
    }

    // Create temporary file with user expenses data
    const tempFile = createTempDataFile(userExpenses, 'user-expenses');
    
    // Path to the Python script
    const scriptPath = path.join(__dirname, '..', 'ai_models', 'spending_prediction', 'spending_forecast.py');
    
    try {
      // Execute Python script with user expenses data
      const result = await executePythonScript(scriptPath, [tempFile]);
      
      // Add charts data from daily forecast if available
      if (result.daily_forecast && result.daily_forecast.length > 0) {
        // Format data for the frontend chart
        const chartData = {
          labels: result.daily_forecast.map(day => day.ds),
          datasets: [
            {
              label: 'Historical Spending',
              data: result.daily_forecast
                .filter(day => day.is_history)
                .map(day => ({x: day.ds, y: day.yhat})),
              borderColor: 'rgba(75, 192, 192, 1)',
              backgroundColor: 'rgba(75, 192, 192, 0.2)',
              pointRadius: 4,
              pointBackgroundColor: 'rgba(75, 192, 192, 1)'
            },
            {
              label: 'Predicted Spending',
              data: result.daily_forecast
                .filter(day => !day.is_history)
                .map(day => ({x: day.ds, y: day.yhat})),
              borderColor: 'rgba(255, 99, 132, 1)',
              backgroundColor: 'rgba(255, 99, 132, 0.2)',
              pointRadius: 4,
              pointBackgroundColor: 'rgba(255, 99, 132, 1)',
              borderDash: [5, 5]
            },
            {
              label: 'Prediction Range (Lower)',
              data: result.daily_forecast
                .filter(day => !day.is_history)
                .map(day => ({x: day.ds, y: day.yhat_lower})),
              borderColor: 'rgba(255, 159, 64, 0.5)',
              backgroundColor: 'rgba(255, 159, 64, 0.1)',
              pointRadius: 0,
              fill: '+1'
            },
            {
              label: 'Prediction Range (Upper)',
              data: result.daily_forecast
                .filter(day => !day.is_history)
                .map(day => ({x: day.ds, y: day.yhat_upper})),
              borderColor: 'rgba(255, 159, 64, 0.5)',
              backgroundColor: 'rgba(255, 159, 64, 0.1)',
              pointRadius: 0,
              fill: false
            }
          ]
        };
        
        // Add chart data to result
        result.chartData = chartData;
      }
      
      res.json(result);
    } catch (error) {
      console.error('Error executing Python script:', error);
      
      // Fallback to the previous implementation if Python script fails
      const lastMonthExpenses = userExpenses.filter(e => {
        const date = new Date(e.date);
        return date.getFullYear() === 2025 && date.getMonth() === 3; // 0-indexed month, so 3 is April
      });

      let totalSpentLastMonth = 0;
      let totalIncomeLastMonth = 0;

      lastMonthExpenses.forEach(e => {
        if (e.isIncome) {
          totalIncomeLastMonth += e.amount;
        } else {
          totalSpentLastMonth += e.amount;
        }
      });

      if (totalSpentLastMonth === 0 && totalIncomeLastMonth === 0) {
        return res.json({
          message: "Pas assez de données du mois dernier pour une prédiction détaillée.",
          predictedTotalNextMonth: (Math.random() * 200 + 800).toFixed(2), // Generic fallback
          predictedCashFlowNext30Days: (Math.random() * 300 - 150).toFixed(2),
          warningDate: null,
          daily_forecast: []
        });
      }
      
      const predictedTotalNextMonth = totalSpentLastMonth * (1 + (Math.random() * 0.2 - 0.1)); // +/- 10% variation
      const predictedCashFlowNext30Days = totalIncomeLastMonth - predictedTotalNextMonth;
      
      let warningDate = null;
      if (predictedCashFlowNext30Days < 0) {
        // Simulate a warning date in the next month if cash flow is negative
        const today = new Date(2025, 4, 20); // Simulating "today" as May 20, 2025
        warningDate = new Date(today.getFullYear(), today.getMonth() + 1, Math.floor(Math.random() * 28) + 1).toISOString().split('T')[0];
      }
      
      res.json({
        message: "Prédictions de dépenses récupérées avec succès (basées sur les données d\\'avril 2025).",
        predictedTotalNextMonth: predictedTotalNextMonth.toFixed(2),
        predictedCashFlowNext30Days: predictedCashFlowNext30Days.toFixed(2),
        warningDate: warningDate,
        daily_forecast: []
      });
    } finally {
      // Clean up temporary file
      deleteTempFile(tempFile);
    }
  } catch (error) {
    console.error('Error in getSpendingPrediction:', error);
    next(error);
  }
};

// @desc    Get anomaly detection for the current user
// @route   GET /api/predictions/anomaly-detection
// @access  Private
const getAnomalyDetection = async (req, res, next) => {
  try {
    const userId = req.user.id; // Keep for future real data use
    const allExpenses = getSampleExpenses();
    const userExpenses = allExpenses.filter(e => e.user === "sample_user_id_for_chart_data" && !e.isIncome);

    if (!userExpenses || userExpenses.length < 5) { // Need some data for anomalies
      return res.json({
        message: "Not enough expense data to detect anomalies.",
        anomalies: [],
      });
    }

    const anomalies = [];

    // 1. Detect unusually high individual expenses (e.g., > 2.5x average for category or overall)
    const categorySpending = {};
    userExpenses.forEach(e => {
      if (!categorySpending[e.category]) {
        categorySpending[e.category] = { total: 0, count: 0, expenses: [] };
      }
      categorySpending[e.category].total += e.amount;
      categorySpending[e.category].count++;
      categorySpending[e.category].expenses.push(e);
    });

    for (const category in categorySpending) {
      const avgSpending = categorySpending[category].total / categorySpending[category].count;
      categorySpending[category].expenses.forEach(exp => {
        if (exp.amount > avgSpending * 1.8 && exp.amount > 30) { // Adjusted thresholds
          anomalies.push({
            id: exp._id || `anomaly-${Date.now()}-${exp.amount}`,
            date: exp.date,
            amount: exp.amount,
            category: exp.category,
            type: 'unusual_spending',
            reason: `Significantly higher than average spending of ${formatCurrency(avgSpending)} for ${category}.`,
            suggestion: "Review this transaction. Was it a one-time purchase or something unexpected?"
          });
        }
      });
    }

    // 2. Detect changes in spending habits (e.g., significant increase in a category month-over-month)
    const marchExpenses = userExpenses.filter(e => new Date(e.date).getMonth() === 2); // March = 2
    const aprilExpenses = userExpenses.filter(e => new Date(e.date).getMonth() === 3); // April = 3

    const marchCategoryTotals = {};
    marchExpenses.forEach(e => {
      marchCategoryTotals[e.category] = (marchCategoryTotals[e.category] || 0) + e.amount;
    });

    const aprilCategoryTotals = {};
    aprilExpenses.forEach(e => {
      aprilCategoryTotals[e.category] = (aprilCategoryTotals[e.category] || 0) + e.amount;
    });

    for (const category in aprilCategoryTotals) {
      if (marchCategoryTotals[category]) {
        const percentageChange = ((aprilCategoryTotals[category] - marchCategoryTotals[category]) / marchCategoryTotals[category]) * 100;
        if (percentageChange > 50 && aprilCategoryTotals[category] > 100) { // >50% increase and significant amount
          anomalies.push({
            id: `habit-change-${category}-${Date.now()}`,
            type: "habit_change",
            description: `Your spending on '${category}' increased by ${percentageChange.toFixed(0)}% from March to April (from ${formatCurrency(marchCategoryTotals[category])} to ${formatCurrency(aprilCategoryTotals[category])}).`,
            suggestion: `Reflect on this change. Is it temporary or a new spending pattern? Adjust your budget if needed.`
          });
        }
      }
    }
    
    // Helper to format currency for messages (can be moved to a util if used elsewhere in backend)
    function formatCurrency(amount, currency = 'USD') {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency }).format(amount);
    }

    res.json({
      message: anomalies.length > 0 ? "Anomaly detection results based on your data." : "No significant anomalies detected in your recent spending.",
      anomalies: anomalies,
    });

  } catch (error) {
    console.error('Error in getAnomalyDetection:', error);
    next(error);
  }
};

// @desc    Get budget optimization suggestions for the current user
// @route   GET /api/predictions/budget-optimization
// @access  Private
const getBudgetOptimization = async (req, res, next) => {
  try {
    const userId = req.user.id; // Keep for future real data use
    const allExpenses = getSampleExpenses();
    const userExpenses = allExpenses.filter(e => e.user === "sample_user_id_for_chart_data" && !e.isIncome);

    if (!userExpenses || userExpenses.length === 0) {
      return res.json({
        message: "No expense data found to provide budget optimizations.",
        optimizations: [],
      });
    }

    // Analyze April 2025 expenses for optimization
    const aprilExpenses = userExpenses.filter(e => {
      const date = new Date(e.date);
      return date.getFullYear() === 2025 && date.getMonth() === 3; // April
    });

    if (aprilExpenses.length === 0) {
      return res.json({
        message: "Not enough data from last month (April 2025) for budget optimization.",
        optimizations: [],
      });
    }

    const categorySpending = {};
    let totalSpentApril = 0;
    aprilExpenses.forEach(e => {
      categorySpending[e.category] = (categorySpending[e.category] || 0) + e.amount;
      totalSpentApril += e.amount;
    });

    const optimizations = [];
    const highSpendingCategories = Object.entries(categorySpending)
      .sort(([,a],[,b]) => b - a) // Sort by amount desc
      .slice(0, 3); // Take top 3 spending categories

    highSpendingCategories.forEach(([category, currentSpending]) => {
      if (currentSpending > 50) { // Only suggest for categories with significant spending
        const suggestedBudget = currentSpending * 0.8; // Suggest 20% reduction
        const potentialSavings = currentSpending - suggestedBudget;
        optimizations.push({
          category: category,
          currentSpending: currentSpending.toFixed(2),
          suggestedBudget: suggestedBudget.toFixed(2),
          potentialSavings: potentialSavings.toFixed(2),
          advice: `You spent ${formatCurrency(currentSpending)} on ${category} last month. Try to reduce it by 20% to ${formatCurrency(suggestedBudget)} and save ${formatCurrency(potentialSavings)}.`
        });
      }
    });

    if (totalSpentApril > 1000) { // Arbitrary threshold for overall advice
         optimizations.push({
            category: "Overall",
            advice: `Your total spending in April was ${formatCurrency(totalSpentApril)}. Consider reviewing all categories for small savings that can add up. The 50/30/20 rule (needs/wants/savings) can be a good guideline.`,
            potentialSavings: (totalSpentApril * 0.05).toFixed(2) // Suggest 5% overall savings
        });
    }
    
    // Helper to format currency for messages
    function formatCurrency(amount, currency = 'USD') {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency }).format(amount);
    }

    res.json({
      message: optimizations.length > 0 ? "Budget optimization suggestions based on your April spending." : "No specific optimization suggestions available at the moment.",
      optimizations: optimizations,
    });

  } catch (error) {
    console.error('Error in getBudgetOptimization:', error);
    next(error);
  }
};

// @desc    Get behavioral nudges for the current user
// @route   GET /api/predictions/behavioral-nudges
// @access  Private
const getBehavioralNudges = async (req, res, next) => {
  try {
    // Simulate fetching recent transactions or spending patterns
    const simulatedNudges = [
      {
        id: 'nudge-1',
        type: "positive_reinforcement",
        message: "Great job on keeping your 'Shopping' expenses low this week!",
        suggestion: "Keep up the good work and consider moving the saved amount to your savings account."
      },
      {
        id: 'nudge-2',
        type: "goal_reminder",
        message: "Remember your goal to save for a vacation? You're 60% there!",
        suggestion: "An extra $50 this week could get you closer."
      }
    ];
    if (Math.random() > 0.6) {
        simulatedNudges.push({
            id: 'nudge-3',
            type: "spending_awareness",
            message: "You've made 5 small purchases under $10 this week. These can add up!",
            suggestion: "Try tracking these 'coffee-run' type expenses for a week to see their total impact."
        });
    }

    res.json({
      message: "Behavioral nudges successfully simulated.",
      nudges: simulatedNudges,
    });

  } catch (error) {
    console.error('Error in getBehavioralNudges:', error);
    next(error);
  }
};

// @desc    Get anonymous benchmarking data
// @route   GET /api/predictions/benchmarking
// @access  Private
const getBenchmarking = async (req, res, next) => {
  try {
    const userId = req.user.id; // Keep for future real data use
    const allExpenses = getSampleExpenses();
    const userExpenses = allExpenses.filter(e => e.user === "sample_user_id_for_chart_data" && !e.isIncome);

    if (!userExpenses || userExpenses.length === 0) {
      return res.json({
        message: "Not enough expense data for benchmarking.",
        benchmarks: [],
      });
    }

    // Use April 2025 data for user's side of benchmark
    const aprilExpenses = userExpenses.filter(e => {
      const date = new Date(e.date);
      return date.getFullYear() === 2025 && date.getMonth() === 3; // April
    });

    if (aprilExpenses.length === 0) {
      return res.json({
        message: "Not enough data from last mois (Avril 2025) pour le benchmarking.",
        benchmarks: [],
      });
    }

    const userCategorySpending = {};
    aprilExpenses.forEach(e => {
      userCategorySpending[e.category] = (userCategorySpending[e.category] || 0) + e.amount;
    });

    // Simulated peer data (in a real app, this would come from aggregated anonymized data)
    const peerAverages = {
      "Groceries": 180.50,
      "Dining Out": 120.00,
      "Transportation": 70.00,
      "Utilities": 150.00,
      "Shopping": 90.00,
      "Entertainment": 75.00,
      "Rent": 1100.00 // Added Rent for comparison
    };

    const benchmarks = [];
    for (const category in userCategorySpending) {
      if (peerAverages[category]) {
        const userSpending = userCategorySpending[category];
        const peerAvg = peerAverages[category];
        let insight = "Your spending is similar to your peers.";
        if (userSpending > peerAvg * 1.15) {
          insight = `You're spending significantly more than peers in ${category}. Peers average ${formatCurrency(peerAvg)}.`;
        } else if (userSpending < peerAvg * 0.85) {
          insight = `You're spending less than peers in ${category}! Peers average ${formatCurrency(peerAvg)}.`;
        }
        benchmarks.push({
          category: category,
          yourSpending: formatCurrency(userSpending),
          peerAverage: formatCurrency(peerAvg),
          insight: insight
        });
      }
    }
    
    // Add a benchmark for a category the user might not have spent in, but peers do
    if (!userCategorySpending["Rent"] && peerAverages["Rent"]) {
        benchmarks.push({
          category: "Rent",
          yourSpending: formatCurrency(0), // User spent 0
          peerAverage: formatCurrency(peerAverages["Rent"]),
          insight: `Peers typically spend around ${formatCurrency(peerAverages["Rent"])} on Rent. You reported no spending in this category last month.`
        });
    }
    
    // Helper to format currency for messages
    function formatCurrency(amount, currency = 'USD') {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency }).format(amount);
    }

    res.json({
      message: benchmarks.length > 0 ? "Benchmarking data based on your April spending compared to simulated peer averages." : "Benchmarking data is currently unavailable.",
      benchmarks: benchmarks.sort((a,b) => (parseFloat(b.yourSpending.replace(/[^\d.-]/g, '')) - parseFloat(a.yourSpending.replace(/[^\d.-]/g, '')))), // Sort by user spending desc
    });

  } catch (error) {
    console.error('Error in getBenchmarking:', error);
    next(error);
  }
};


module.exports = {
  getSpendingPrediction,
  getAnomalyDetection,
  getBudgetOptimization,
  getBehavioralNudges,
  getBenchmarking,
};
