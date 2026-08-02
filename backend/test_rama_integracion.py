"""
TEST DE VERIFICACION - Rama feature/integracion-api
====================================================
Verifica que el motor estadístico Westgard (qc_logic.py) funciona correctamente.
Este script NO necesita base de datos para correr.

Ejecutar con:
    python test_rama_integracion.py
"""

import sys
import traceback

# ============================================================
# TEST 1: Importación del módulo
# ============================================================
def test_importacion():
    print("\n[TEST 1] Importando módulo qc_logic...", end=" ")
    try:
        from app.qc_logic import evaluar_westgard
        print("✅ OK")
        return evaluar_westgard
    except ImportError as e:
        print(f"❌ FALLO: {e}")
        sys.exit(1)

# ============================================================
# TEST 2: Valor normal (debe ser Aceptado)
# ============================================================
def test_valor_normal(evaluar_westgard):
    print("[TEST 2] Valor normal dentro de ±1 SD...", end=" ")
    valores = [100.0, 100.5, 99.8]
    media = 100.0
    sd = 2.5
    resultado = evaluar_westgard(valores, media, sd)
    assert resultado["viola_regla"] == False, f"Se esperaba False, se obtuvo {resultado}"
    assert resultado["regla_rota"] is None
    print(f"✅ OK → {resultado['mensaje']}")

# ============================================================
# TEST 3: Regla 1_3s — valor extremo (RECHAZO)
# ============================================================
def test_regla_1_3s(evaluar_westgard):
    print("[TEST 3] Regla 1_3s — valor excede ±3 SD (debe RECHAZAR)...", end=" ")
    # valor_hoy = 110.0 con media=100, sd=2.5 → Z = (110-100)/2.5 = 4.0
    valores = [100.0, 110.0]
    media = 100.0
    sd = 2.5
    resultado = evaluar_westgard(valores, media, sd)
    assert resultado["viola_regla"] == True, f"Se esperaba True, se obtuvo {resultado}"
    assert resultado["regla_rota"] == "1_3s", f"Se esperaba '1_3s', se obtuvo '{resultado['regla_rota']}'"
    print(f"✅ OK → {resultado['mensaje']}")

# ============================================================
# TEST 4: Regla 2_2s — dos consecutivos > +2 SD (RECHAZO)
# ============================================================
def test_regla_2_2s(evaluar_westgard):
    print("[TEST 4] Regla 2_2s — dos consecutivos por encima de +2 SD (debe RECHAZAR)...", end=" ")
    # media=100, sd=2.5 → +2SD = 105.0
    # valores: 105.5 (Z=+2.2) y 106.0 (Z=+2.4)
    valores = [100.0, 105.5, 106.0]
    media = 100.0
    sd = 2.5
    resultado = evaluar_westgard(valores, media, sd)
    assert resultado["viola_regla"] == True, f"Se esperaba True, se obtuvo {resultado}"
    assert resultado["regla_rota"] == "2_2s", f"Se esperaba '2_2s', se obtuvo '{resultado['regla_rota']}'"
    print(f"✅ OK → {resultado['mensaje']}")

# ============================================================
# TEST 5: Regla R_4s — diferencia de 4 SD entre consecutivos
# ============================================================
def test_regla_r4s(evaluar_westgard):
    print("[TEST 5] Regla R_4s — diferencia ≥4 SD entre consecutivos (debe RECHAZAR)...", end=" ")
    # media=100, sd=2.5
    # valor1=95.0 → Z=-2.0 (lado negativo)
    # valor2=105.5 → Z=+2.2 (lado positivo)
    # diferencia Z = 2.2 - (-2.0) = 4.2 → viola R_4s
    valores = [100.0, 95.0, 105.5]
    media = 100.0
    sd = 2.5
    resultado = evaluar_westgard(valores, media, sd)
    assert resultado["viola_regla"] == True, f"Se esperaba True, se obtuvo {resultado}"
    assert resultado["regla_rota"] == "R_4s", f"Se esperaba 'R_4s', se obtuvo '{resultado['regla_rota']}'"
    print(f"✅ OK → {resultado['mensaje']}")

# ============================================================
# TEST 6: Regla 1_2s — advertencia (acepta pero advierte)
# ============================================================
def test_regla_1_2s(evaluar_westgard):
    print("[TEST 6] Regla 1_2s — valor entre ±2 y ±3 SD (ADVERTENCIA, no rechaza)...", end=" ")
    # media=100, sd=2.5 → +2SD=105.0, +3SD=107.5
    # valor = 105.5 → Z = (105.5-100)/2.5 = +2.2 → solo advertencia 1_2s
    valores = [100.0, 102.0, 105.5]
    media = 100.0
    sd = 2.5
    resultado = evaluar_westgard(valores, media, sd)
    assert resultado["viola_regla"] == False, f"Se esperaba False (solo advertencia), se obtuvo {resultado}"
    assert resultado["regla_rota"] == "1_2s", f"Se esperaba '1_2s', se obtuvo '{resultado['regla_rota']}'"
    print(f"✅ OK → {resultado['mensaje']}")

# ============================================================
# TEST 7: Lista vacía (edge case)
# ============================================================
def test_lista_vacia(evaluar_westgard):
    print("[TEST 7] Edge case — lista vacía (no debe crashear)...", end=" ")
    resultado = evaluar_westgard([], 100.0, 2.5)
    assert resultado["viola_regla"] == False
    print(f"✅ OK → {resultado['mensaje']}")

# ============================================================
# TEST 8: SD = 0 (edge case — división por cero)
# ============================================================
def test_sd_cero(evaluar_westgard):
    print("[TEST 8] Edge case — SD = 0 (no debe lanzar ZeroDivisionError)...", end=" ")
    resultado = evaluar_westgard([100.0, 100.0], 100.0, 0)
    assert resultado["viola_regla"] == False
    print(f"✅ OK → {resultado['mensaje']}")

# ============================================================
# EJECUTAR TODOS LOS TESTS
# ============================================================
if __name__ == "__main__":
    print("=" * 60)
    print("  SUITE DE TESTS — feature/integracion-api")
    print("  Motor estadístico Westgard (qc_logic.py)")
    print("=" * 60)

    errores = []

    evaluar_westgard = test_importacion()

    tests = [
        test_valor_normal,
        test_regla_1_3s,
        test_regla_2_2s,
        test_regla_r4s,
        test_regla_1_2s,
        test_lista_vacia,
        test_sd_cero,
    ]

    pasados = 0
    for test in tests:
        try:
            test(evaluar_westgard)
            pasados += 1
        except Exception as e:
            errores.append((test.__name__, str(e)))
            print(f"❌ FALLO")
            traceback.print_exc()

    print("\n" + "=" * 60)
    print(f"  RESULTADO: {pasados}/{len(tests)} tests pasaron")
    if errores:
        print("\n  Tests fallidos:")
        for nombre, err in errores:
            print(f"  - {nombre}: {err}")
    else:
        print("  ✅ ¡Todos los tests pasaron! La rama está en buen estado.")
    print("=" * 60)
