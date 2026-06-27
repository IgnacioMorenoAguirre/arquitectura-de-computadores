"""Conversor de minusculas a mayusculas - referencia en alto nivel (HLL).

Equivalente del programa MIPS desarrollado en MARS. Esta version es la mas
comoda para CORRER y demostrar la salida en vivo.

Nota: en Python los strings son inmutables, por eso se construye una lista y se
une al final. En C/MIPS, en cambio, se modifica el mismo byte en memoria (sb),
que es lo que ocurre realmente en el datapath.
"""


def transformar(s):
    resultado = []
    for c in s:                       # bucle: lbu (leer byte) + beq (fin de cadena)
        if 'a' <= c <= 'z':           # slti/bne + slti/beq: rango a..z
            c = chr(ord(c) - 32)      # addi -32 + sb: pasar a mayuscula
        resultado.append(c)
        # addi +1: avanzar al siguiente caracter
    return ''.join(resultado)


if __name__ == "__main__":
    mensaje = "holaComoEstas"
    print(transformar(mensaje))       # jal transformar; luego imprimir -> HOLACOMOESTAS
