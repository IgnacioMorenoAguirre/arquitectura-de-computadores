/* Conversor de minusculas a mayusculas - referencia en alto nivel (HLL)
 * Equivalente exacto del programa MIPS desarrollado en MARS.
 * C es la mejor referencia porque mapea casi 1:1 con el assembler:
 * el puntero 's' es como $t0, *s es un 'lbu', y la asignacion *s=... es un 'sb'.
 */
#include <stdio.h>

void transformar(char *s) {
    while (*s != '\0') {              /* lbu $t1,0($t0) + beq: leer byte, parar en '\0' */
        if (*s >= 'a' && *s <= 'z') { /* slti/bne + slti/beq: ¿esta en el rango a..z? */
            *s = *s - 32;             /* addi $t1,$t1,-32 + sb: pasar a mayuscula */
        }
        s++;                          /* addi $t0,$t0,1: avanzar al siguiente byte */
    }
}

int main(void) {
    char mensaje[] = "holaComoEstas";
    transformar(mensaje);             /* jal transformar */
    printf("%s\n", mensaje);          /* mostrar resultado: HOLACOMOESTAS */
    return 0;                         /* li $v0,10 + syscall: terminar */
}
