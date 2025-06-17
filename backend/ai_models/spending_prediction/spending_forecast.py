#!/usr/bin/env python3
# filepath: d:\Programmation\React\BudgetBuddy\backend\ai_models\spending_prediction\spending_forecast.py

import sys
import json
import pandas as pd
import numpy as np
from prophet import Prophet
import matplotlib.pyplot as plt
from datetime import datetime, timedelta

def load_data(json_data):
    """
    Load and prepare JSON data for Prophet model
    """
    try:
        # Parse data if it's a string
        if isinstance(json_data, str):
            data = json.loads(json_data)
        else:
            data = json_data
            
        # Filter out income entries
        expenses = [entry for entry in data if not entry.get('isIncome', False)]
        
        # Convert to DataFrame
        df = pd.DataFrame(expenses)
        
        # Convert date strings to datetime
        df['date'] = pd.to_datetime(df['date'])
        
        # Prepare data for Prophet (needs 'ds' for dates and 'y' for values)
        daily_expenses = df.groupby(df['date'].dt.date)['amount'].sum().reset_index()
        daily_expenses.columns = ['ds', 'y']
        
        return daily_expenses
    except Exception as e:
        print(f"Error loading data: {str(e)}", file=sys.stderr)
        sys.exit(1)

def train_prophet_model(data, forecast_days=30):
    """
    Train Prophet model and generate forecasts
    """
    try:
        model = Prophet(
            seasonality_mode='multiplicative',
            yearly_seasonality=True,
            weekly_seasonality=True,
            daily_seasonality=False,
            changepoint_prior_scale=0.05  # Flexibility of trend
        )
        
        model.fit(data)
        
        # Create future dataframe for predictions
        future = model.make_future_dataframe(periods=forecast_days)
        forecast = model.predict(future)
        
        # Extract last 30 days of historical data + 30 days of forecast
        last_date = data['ds'].max()
        start_date = last_date - timedelta(days=30)
        
        # Get forecast for relevant date range
        result_forecast = forecast[forecast['ds'] >= start_date].copy()
        
        # Mark which rows are actual history vs. predictions
        result_forecast['is_history'] = result_forecast['ds'] <= last_date
        
        # Format dates and round values
        result_forecast['ds'] = result_forecast['ds'].dt.strftime('%Y-%m-%d')
        for col in ['yhat', 'yhat_lower', 'yhat_upper']:
            result_forecast[col] = result_forecast[col].round(2)
        
        # Calculate potential cash flow issues
        last_30_days_avg = data[data['ds'] >= pd.to_datetime(start_date)]['y'].mean()
        high_spending_days = result_forecast[
            (result_forecast['is_history'] == False) & 
            (result_forecast['yhat'] > last_30_days_avg * 1.5)
        ]
        
        warning_date = None
        if not high_spending_days.empty:
            warning_date = high_spending_days.iloc[0]['ds']
            
        # Calculate total predicted spending for next month
        next_30_days = result_forecast[result_forecast['is_history'] == False]
        predicted_total = next_30_days['yhat'].sum()
        
        # Assuming we know the average income (this would come from actual data)
        # For now, we'll estimate from typical income amounts in the sample data
        estimated_monthly_income = 4000  # This should be calculated from real user data
        
        predicted_cash_flow = estimated_monthly_income - predicted_total
        
        # Prepare output
        output = {
            'daily_forecast': result_forecast[['ds', 'yhat', 'yhat_lower', 'yhat_upper', 'is_history']].to_dict('records'),
            'predicted_total_next_month': round(predicted_total, 2),
            'predicted_cash_flow_next_30_days': round(predicted_cash_flow, 2),
            'warning_date': warning_date,
            'message': "Prédictions de dépenses générées avec succès."
        }
        
        return output
        
    except Exception as e:
        print(f"Error in Prophet model: {str(e)}", file=sys.stderr)
        sys.exit(1)

def generate_forecast(json_data):
    """
    Main function to generate spending forecast
    """
    try:
        # Load and prepare data
        data = load_data(json_data)
        
        # Check if we have enough data
        if len(data) < 14:  # Need at least 2 weeks of data for meaningful predictions
            return json.dumps({
                'message': "Pas assez de données pour générer une prédiction fiable.",
                'predicted_total_next_month': None,
                'predicted_cash_flow_next_30_days': None,
                'warning_date': None,
                'daily_forecast': []
            })
        
        # Train model and generate forecast
        forecast_result = train_prophet_model(data)
        
        # Return JSON result
        return json.dumps(forecast_result)
        
    except Exception as e:
        error_response = {
            'error': str(e),
            'message': "Une erreur est survenue lors de la génération des prédictions."
        }
        return json.dumps(error_response)

if __name__ == "__main__":
    # Check if JSON data is provided as argument
    if len(sys.argv) > 1:
        input_file = sys.argv[1]
        try:
            with open(input_file, 'r') as f:
                json_data = json.load(f)
            result = generate_forecast(json_data)
            print(result)
        except Exception as e:
            print(json.dumps({'error': str(e)}))
    else:
        # Read from stdin if no file is provided
        try:
            json_data = json.load(sys.stdin)
            result = generate_forecast(json_data)
            print(result)
        except Exception as e:
            print(json.dumps({'error': str(e)}))
