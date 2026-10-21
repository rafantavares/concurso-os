import pandas as pd
import json
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score
from sklearn.preprocessing import LabelEncoder
import os

def run_experiment():
    dataset_path = 'dataset_v1.json'
    
    if not os.path.exists(dataset_path):
        print("ML NOT READY — DATA INSUFFICIENT")
        print("Dataset não encontrado. Rode `npx tsx extract_dataset.ts` primeiro.")
        return

    with open(dataset_path, 'r') as f:
        data = json.load(f)

    if len(data) < 500:
        print("ML NOT READY — DATA INSUFFICIENT")
        print(f"Amostra atual ({len(data)} linhas) é insuficiente para generalização.")
        print("Recomendado: mínimo de 500 a 1000 observações para evitar overfitting massivo.")
        return

    df = pd.DataFrame(data)

    # 1. Feature Engineering & Encoding
    le = LabelEncoder()
    df['intervention_type_encoded'] = le.fit_transform(df['intervention_type'])
    
    # 2. Prevent Leakage: Only use features available AT THE TIME of intervention
    X = df[['intervention_type_encoded', 'performance_before', 'spi_at_time']]
    y = df['improved']

    # 3. Train-test split (Ideally should be grouped by user_id to prevent leakage across users, but simplified here)
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    # 4. Baseline (Simulate the deterministic rule which assumes everything improves)
    baseline_preds = [1] * len(y_test)
    baseline_acc = accuracy_score(y_test, baseline_preds)

    # 5. Train Model
    clf = RandomForestClassifier(random_state=42)
    clf.fit(X_train, y_train)

    # 6. Evaluate
    preds = clf.predict(X_test)
    ml_acc = accuracy_score(y_test, preds)

    print("=== RESULTADOS DO EXPERIMENTO ===")
    print(f"Observações Elegíveis: {len(df)}")
    print(f"Baseline Accuracy (Determinístico): {baseline_acc:.2f}")
    print(f"ML (Random Forest) Accuracy: {ml_acc:.2f}")
    
    if ml_acc > baseline_acc:
        print("\nSINAL DETECTADO: O modelo obteve ganhos sobre a baseline.")
    else:
        print("\nSEM SINAL: O modelo não conseguiu bater as regras determinísticas.")

if __name__ == "__main__":
    run_experiment()
