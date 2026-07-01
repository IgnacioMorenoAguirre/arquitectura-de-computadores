.data
    mensaje: .asciiz "holaComoEstas"

.text
main:
    # Cargar la direccion
    la   $a0, mensaje
    jal  transformar
    # Imprimir
    li   $v0, 4
    syscall
    # Terminar el programa
    li   $v0, 10
    syscall

transformar:
    move $t0, $a0            # copia la direccion
bucle:
    # 1. Cargar el byte sin signo
    lbu  $t1, 0($t0)
    beq  $t1, $zero, fin     # si es el caracter nulo, terminar
    # 2. Verificar si es menor que 'a' (ASCII 97)
    slti $t3, $t1, 97
    bne  $t3, $zero, continuar
    # 3. Verificar si es mayor que 'z' (ASCII 122)
    slti $t3, $t1, 123
    beq  $t3, $zero, continuar
    # 4. Es minuscula: restar 32 (ADDI)
    addi $t1, $t1, -32
    # 5. Guardar el byte modificado (SB - Store Byte)
    sb   $t1, 0($t0)         # <-- ESTA es tu instruccion
continuar:
    addi $t0, $t0, 1         # avanzar al siguiente byte
    j    bucle
fin:
    jr   $ra                 # retornar al procedimiento principal
