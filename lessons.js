"use strict";
const cExamples = [];
function code(source) {
  return `<pre><code>${source.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;")}</code></pre>`;
}
function program(source, output) {
  cExamples.push({ source, output });
  return code(source) + `<p><strong>Expected output</strong></p>${code(output)}`;
}
function quiz(question, options, answer, explanation) {
  return { question, options, answer, explanation };
}
const lessons = [
  {
    id: "welcome", track: "C foundations", title: "Your first C program", minutes: 8,
    summary: "A program is a list of instructions. Start by asking the computer to print one line.",
    body: `<h3>Your safe practice space</h3>
      <p>You do not need electronics yet. Use an Ubuntu Linux VM (virtual machine: a computer inside your computer), or an ordinary Linux terminal for this C track. Save each full example in <code>lesson.c</code>, replacing the previous example.</p>
      <p>On Ubuntu, install the tools once:</p>${code("sudo apt update\nsudo apt install build-essential")}
      <p>Then compile (turn C text into a program) and run:</p>${code("gcc -std=c11 -Wall -Wextra -Werror lesson.c -o lesson\n./lesson")}
      ${program(String.raw`#include <stdio.h>

int main(void)
{
    printf("Hello, sensor!\n");
    return 0;
}`, "Hello, sensor!\n")}
      <p><code>#include &lt;stdio.h&gt;</code> makes standard input/output functions such as <code>printf</code> available. <code>main</code> is where your program starts. Braces group instructions; a semicolon ends a statement. <code>\\n</code> prints a new line. <code>return 0;</code> reports success to the operating system.</p>
      <div class="callout">This website does not execute C. Read the example, run it in your terminal, then use the quiz to check your understanding.</div>
      <h3>Try it</h3><p>Change the message to your name. Save, compile again, and run. When the compiler reports an error, read its first message and line number before changing anything.</p>`,
    quiz: [quiz("Where does this C program begin running?", ["At main", "At printf's library source", "At the last semicolon"], 0, "main is the entry point of this ordinary hosted C program. printf is called from inside main.")]
  },
  {
    id: "variables", track: "C foundations", title: "Variables, int, and printf", minutes: 6,
    summary: "Give a whole-number sensor reading a name so you can store it and use it.",
    body: `<p>A variable is named storage. <code>int</code> holds whole numbers such as 25 or -4, within a limited range. Initialize it before reading it.</p>
      ${program(String.raw`#include <stdio.h>

int main(void)
{
    int temperature = 25;
    printf("Temperature: %d C\n", temperature);
    temperature = 28;
    printf("Now: %d C\n", temperature);
    return 0;
}`, "Temperature: 25 C\nNow: 28 C\n")}
      <p><code>%d</code> tells <code>printf</code> to format an <code>int</code>. The second argument supplies its value. A single <code>=</code> assigns a value; it does not ask a question.</p>
      <h3>Try it</h3><p>Add <code>int humidity = 60;</code> and print it with a second <code>printf</code>. Keep the format specifier matched to the value's type.</p>`,
    quiz: [quiz("After int reading = 10; reading = 14; what is reading?", ["10", "14", "24"], 1, "The assignment replaces the stored value. It does not add to it.")]
  },
  {
    id: "decimals", track: "C foundations", title: "Decimals with double", minutes: 6,
    summary: "Measure a value like 23.75 and choose how many decimal places to display.",
    body: `<p><code>double</code> is a floating-point type. It can represent fractional values, usually approximately. <code>%.1f</code> displays one decimal place; <code>%.2f</code> displays two.</p>
      ${program(String.raw`#include <stdio.h>

int main(void)
{
    double temperature = 23.75;
    printf("%.1f C\n", temperature);
    printf("%.2f C\n", temperature);
    return 0;
}`, "23.8 C\n23.75 C\n")}
      <p>Formatting rounds the displayed text, not the stored variable. <code>%f</code> in <code>printf</code> expects a <code>double</code>; do not pass an <code>int</code> to it.</p>
      <div class="callout warning">These are user-space examples. Ordinary Linux kernel driver code must not use floating-point arithmetic. Drivers commonly use integer units such as millidegrees Celsius: 23750 means 23.750 C.</div>
      <h3>Try it</h3><p>Change the value to <code>18.625</code> and compare one, two, and three displayed decimal places.</p>`,
    quiz: [quiz("What does %.2f change?", ["The stored type to int", "The displayed decimal places", "The sensor's accuracy"], 1, "It formats the output to two decimal places. It does not improve accuracy or change the stored number.")]
  },
  {
    id: "calculations", track: "C foundations", title: "Calculations and division", minutes: 8,
    summary: "Add, subtract, multiply, divide, and avoid an easy integer-division trap.",
    body: `<p>C uses <code>+</code>, <code>-</code>, <code>*</code>, and <code>/</code>. Parentheses make the grouping clear. For integers, <code>%</code> gives the remainder.</p>
      ${program(String.raw`#include <stdio.h>

int main(void)
{
    int samples = 5;
    int sensors = 2;
    double temperature = 25.0;
    printf("Integer division: %d\n", samples / sensors);
    printf("Decimal division: %.1f\n", samples / 2.0);
    printf("Fahrenheit: %.1f\n", temperature * 9 / 5 + 32);
    return 0;
}`, "Integer division: 2\nDecimal division: 2.5\nFahrenheit: 77.0\n")}
      <p><code>5 / 2</code> is integer division, so the fractional part is discarded. Storing that result in a <code>double</code> afterward cannot recover it. <code>5 / 2.0</code> uses floating-point arithmetic.</p>
      <p><code>temperature * 9 / 5</code> already uses floating-point because <code>temperature</code> is a <code>double</code> and multiplication/division group left to right. However, <code>temperature * (9 / 5)</code> computes the integer-only parentheses first: 9/5 is 1! Write <code>9.0 / 5.0</code> when the ratio is computed separately.</p>
      <div class="callout warning">Never divide by zero. Signed integer overflow is undefined behavior, not a reliable wraparound calculator.</div>`,
    quiz: [quiz("What value does double average = 5 / 2; store?", ["2.5", "2.0", "0.0"], 1, "Both operands are int, so the division produces 2 first. Conversion to double then gives 2.0."),
      quiz("Does temperature * 9 / 5 need 9.0 if temperature is double?", ["Yes, always", "No, the double operand already promotes the arithmetic"], 1, "The operations group left to right. But temperature * (9 / 5) has a separate integer-only division and is different.")]
  },
  {
    id: "conditions", track: "C foundations", title: "Decisions with if and else", minutes: 7,
    summary: "Let a temperature reading decide whether a fan should be on.",
    body: `${program(String.raw`#include <stdio.h>

int main(void)
{
    int temperature = 31;
    if (temperature >= 30) {
        printf("Fan on\n");
    } else {
        printf("Fan off\n");
    }
    return 0;
}`, "Fan on\n")}
      <p><code>&gt;=</code> means greater than or equal to. Other comparisons include <code>&gt;</code>, <code>&lt;</code>, <code>&lt;=</code>, <code>==</code> (equal), and <code>!=</code> (not equal). Compare with <code>==</code>, assign with <code>=</code>.</p>
      <p>In an <code>if</code>, zero is false and any nonzero scalar value is true, not only 1. Comparisons themselves produce 0 or 1. Use <code>&amp;&amp;</code> for logical AND, <code>||</code> for logical OR, and <code>!</code> for logical NOT. These are different from bitwise operations.</p>
      <h3>Try it</h3><p>Use 29, 30, and 31 to check both sides of the threshold. A boundary value is a useful test.</p>`,
    quiz: [quiz("Which branch runs for if (8)?", ["The if branch", "The else branch", "Neither, only 1 is true"], 0, "8 is nonzero, so it is treated as true. Nonzero bit masks also work in conditions.")]
  },
  {
    id: "while", track: "C foundations", title: "Repeat with while", minutes: 6,
    summary: "Repeat a small task while a condition remains true.",
    body: `${program(String.raw`#include <stdio.h>

int main(void)
{
    int sample = 0;
    while (sample < 3) {
        printf("Sample %d\n", sample);
        sample++;
    }
    return 0;
}`, "Sample 0\nSample 1\nSample 2\n")}
      <p>The condition is tested before each repetition. <code>sample++</code> increases the variable by one. After sample becomes 3, <code>3 &lt; 3</code> is false and the loop stops. A loop can run zero times if its first condition is false.</p>
      <div class="callout warning">Forgetting to update the counter can create an endless loop. In a terminal, Ctrl+C normally interrupts this user-space program. Real driver code must not spin forever waiting for hardware.</div>
      <h3>Try it</h3><p>Start sample at 3. Predict the number of lines before running.</p>`,
    quiz: [quiz("How many times does while (sample < 3) run if sample starts at 3?", ["Zero", "One", "Three"], 0, "The condition is checked first. 3 is not less than 3.")]
  },
  {
    id: "for", track: "C foundations", title: "The three parts of for", minutes: 7,
    summary: "Put initialization, condition, and increment in one place.",
    body: `${program(String.raw`#include <stdio.h>

int main(void)
{
    for (int i = 0; i < 3; i++) {
        printf("Reading %d\n", i);
    }
    return 0;
}`, "Reading 0\nReading 1\nReading 2\n")}
      <p><strong>Initialization:</strong> <code>int i = 0</code> runs once at the start. <strong>Condition:</strong> <code>i &lt; 3</code> is tested before each iteration. <strong>Increment:</strong> <code>i++</code> runs after each completed loop body, before the next condition test.</p>
      <p>Trace it: initialize 0 → test → print 0 → increment to 1 → test → print 1 → increment to 2 → test → print 2 → increment to 3 → test fails.</p>
      <p>The variable declared in this <code>for</code> header exists only inside the loop's scope. Use the <code>while</code> lesson when the number of repetitions is not known in advance.</p>
      <h3>Try it</h3><p>Change <code>i++</code> to <code>i += 2</code>. What values will be printed?</p>`,
    quiz: [quiz("When does i++ run in this loop?", ["Before initialization", "After the loop body, before the next condition test", "Only after the whole loop ends"], 1, "The increment follows each completed body execution; then the condition is checked again.")]
  },
  {
    id: "functions", track: "C foundations", title: "Functions and return values", minutes: 7,
    summary: "Name a reusable calculation and send its result back to the caller.",
    body: `${program(String.raw`#include <stdio.h>

int add_offset(int reading, int offset)
{
    return reading + offset;
}

int main(void)
{
    int corrected = add_offset(20, 2);
    printf("Corrected: %d\n", corrected);
    return 0;
}`, "Corrected: 22\n")}
      <p>The first <code>int</code> is the return type. <code>reading</code> and <code>offset</code> are parameters: local copies of the arguments 20 and 2. <code>return</code> sends a value back and ends this function call.</p>
      <p>A function returning <code>void</code> does not return a value. Declare functions before calling them, as this example does. Changing a plain integer parameter does not change the caller's integer; later we will pass an address to update an original object.</p>
      <h3>Try it</h3><p>Add a function <code>int twice(int value)</code> that returns <code>value * 2</code> and print its return value.</p>`,
    quiz: [quiz("Does changing a function's int parameter change the caller's int variable?", ["Yes", "No"], 1, "C passes arguments by value. The parameter is a copy. Pointers let a function access a separate original object.")]
  },
  {
    id: "arrays", track: "C foundations", title: "Arrays start at zero", minutes: 7,
    summary: "Store several readings of the same type and stay inside their bounds.",
    body: `${program(String.raw`#include <stdio.h>

int main(void)
{
    int readings[3] = {21, 22, 24};
    for (int i = 0; i < 3; i++) {
        printf("%d: %d\n", i, readings[i]);
    }
    return 0;
}`, "0: 21\n1: 22\n2: 24\n")}
      <p>An array holds a fixed number of consecutive elements of the same type. The first element is <code>readings[0]</code>, and the last here is <code>readings[2]</code>. The length is 3, not the last index.</p>
      <div class="callout warning">C does not automatically check array bounds. <code>readings[3]</code> is out of bounds: reading or writing it is undefined behavior, even if it seems to work once. Use <code>i &lt; 3</code>, not <code>i &lt;= 3</code>.</div>
      <h3>Try it</h3><p>Add a fourth reading and update both the declared length and loop limit. Later, sizeof will let you calculate the element count instead.</p>`,
    quiz: [quiz("Which indexes are valid for int values[4]?", ["1, 2, 3, 4", "0, 1, 2, 3", "0, 1, 2, 3, 4"], 1, "Four elements have indexes zero through three. Index four is one past the last element and must not be accessed.")]
  },
  {
    id: "pointers", track: "C foundations", title: "Pointers, & and two meanings of *", minutes: 10,
    summary: "A pointer holds an address. Use that address to reach an existing value.",
    body: `${program(String.raw`#include <stdio.h>

int main(void)
{
    int reading = 25;
    int *p = &reading;
    printf("Value: %d\n", *p);
    *p = 30;
    printf("Original: %d\n", reading);
    return 0;
}`, "Value: 25\nOriginal: 30\n")}
      <p><code>&amp;reading</code> means the address of reading. In the declaration <code>int *p</code>, the star declares p as a pointer to int. In the expression <code>*p</code>, the star <em>dereferences</em> the pointer: it accesses the int at that address.</p>
      <p>There is also multiplication: <code>3 * 4</code>. Context tells you which meaning is intended. Think of a pointer as a location, not a second copy of the reading.</p>
      <div class="callout warning">Only dereference a pointer to a live object of a suitable type that you are allowed to access. Do not invent numeric addresses or use an uninitialized pointer. An address of a local variable stops being valid after that variable's lifetime ends.</div>
      <h3>Try it</h3><p>Change <code>*p = 30;</code> to <code>*p += 2;</code>. Predict reading before running.</p>`,
    quiz: [quiz("In int *p = &reading; what does &reading supply?", ["The value of reading", "The address of reading", "The size of reading"], 1, "& takes the object's address. The declaration's * says p is a pointer; *p in an expression accesses the pointed-to object.")]
  },
  {
    id: "structs", track: "C foundations", title: "Group data with structs", minutes: 7,
    summary: "Keep the fields of one sensor together instead of using unrelated variables.",
    body: `${program(String.raw`#include <stdio.h>

struct Sensor {
    int id;
    int temperature;
};

int main(void)
{
    struct Sensor room = { .id = 1, .temperature = 24 };
    printf("Sensor %d: %d C\n", room.id, room.temperature);
    return 0;
}`, "Sensor 1: 24 C\n")}
      <p>The struct declaration describes a type. <code>room</code> is an object of that type. Its members can have different types; this simple example uses two ints. Use the dot <code>.</code> with the struct object itself.</p>
      <p><code>.id = 1</code> is a designated initializer: it names the member being initialized. <code>room.temperature = 26;</code> updates just that field.</p>
      <h3>Try it</h3><p>Add an <code>int humidity</code> member, initialize it, and print it.</p>`,
    quiz: [quiz("How do you access temperature in the struct object room?", ["room.temperature", "room->temperature", "*room.temperature"], 0, "Use dot with an actual struct object. The arrow operator is for a pointer to a struct.")]
  },
  {
    id: "struct-pointers", track: "C foundations", title: "Struct pointers: . versus ->", minutes: 8,
    summary: "Follow a pointer to a sensor and access one of its fields.",
    body: `${program(String.raw`#include <stdio.h>

struct Sensor {
    int temperature;
};

int main(void)
{
    struct Sensor room = { .temperature = 24 };
    struct Sensor *p = &room;
    p->temperature = 27;
    printf("%d %d\n", room.temperature, (*p).temperature);
    return 0;
}`, "27 27\n")}
      <p><code>room.temperature</code> uses the object directly. <code>p-&gt;temperature</code> uses a pointer. It means the same thing as <code>(*p).temperature</code>. Parentheses are needed in the expanded form because dot binds more tightly than dereference.</p>
      <p>Both expressions in the print refer to the very same member, not independent sensors. Arrow does not validate a pointer for you.</p>
      <h3>Try it</h3><p>Read through the pointer, then update through the object and read through the pointer again.</p>`,
    quiz: [quiz("What is p->temperature equivalent to?", ["(*p).temperature", "*p.temperature", "&p.temperature"], 0, "Dereference p to get the struct, then use dot. The parentheses express that order.")]
  },
  {
    id: "strings", track: "C foundations", title: "Strings and the null terminator", minutes: 8,
    summary: "Text in C is a sequence of characters ending with a special zero byte.",
    body: `${program(String.raw`#include <stdio.h>

int main(void)
{
    char name[] = "room";
    name[0] = 'R';
    printf("%s\n", name);
    printf("Terminator is zero: %d\n", name[4] == '\0');
    return 0;
}`, "Room\nTerminator is zero: 1\n")}
      <p>The array holds five characters: <code>'r'</code>, <code>'o'</code>, <code>'o'</code>, <code>'m'</code>, and <code>'\\0'</code>. The last is the null terminator, the character with value zero, not the printable digit <code>'0'</code>.</p>
      <p><code>%s</code> reads characters until it reaches a null terminator. Without a terminator within valid storage, it can read out of bounds. A four-letter C string therefore needs at least five bytes.</p>
      <div class="callout warning">Use <code>char name[] = "room";</code> for a modifiable array. A pointer such as <code>const char *label = "room";</code> can refer to a string literal for reading. Never try to modify a string literal.</div>
      <h3>Try it</h3><p>Write out the indexes of <code>"sensor"</code>, including its terminator, before declaring an array to hold it.</p>`,
    quiz: [quiz('How much room is needed for the C string "LED"?', ["3 bytes", "4 bytes", "2 bytes"], 1, "L, E, D, and the terminating zero byte take four bytes.")]
  },
  {
    id: "sizeof", track: "C foundations", title: "sizeof, size_t, and array length", minutes: 9,
    summary: "Measure storage in bytes, and do not confuse a pointer's size with an array's length.",
    body: `${program(String.raw`#include <stdio.h>

int main(void)
{
    int readings[] = {20, 21, 22};
    size_t count = sizeof readings / sizeof readings[0];
    printf("Elements: %zu\n", count);
    for (size_t i = 0; i < count; i++) {
        printf("%d\n", readings[i]);
    }
    return 0;
}`, "Elements: 3\n20\n21\n22\n")}
      <p><code>sizeof</code> produces the size in C bytes, as type <code>size_t</code>, an unsigned integer type. Print it with <code>%zu</code>. Sizes depend on the type and platform; do not assume every int or pointer is four bytes. On our Linux target, a byte is eight bits.</p>
      <p>For an actual array, total array size divided by one element's size gives the number of elements. <code>sizeof "room"</code> includes the terminator and is 5.</p>
      <div class="callout warning">In a function parameter, <code>int readings[]</code> is adjusted to a pointer, not an array copy. <code>sizeof readings</code> there measures a pointer. Pass the element count separately. The same problem occurs with a local pointer <code>int *p = readings;</code>: sizeof p is not the size of readings.</div>
      <h3>Try it</h3><p>Add an element without changing the loop. Verify that the calculated count updates automatically.</p>`,
    quiz: [quiz("What does sizeof p measure when p is int *?", ["All elements p points toward", "The pointer object", "The first int only"], 1, "A pointer does not carry an array length. sizeof sees the pointer type, not the allocation it might reference.")]
  },
  {
    id: "update-original", track: "C foundations", title: "Update the original through a function", minutes: 9,
    summary: "Pass a sensor's address so a helper can change the original sensor.",
    body: `${program(String.raw`#include <stdio.h>

struct Sensor {
    int temperature;
};

void set_temperature(struct Sensor *sensor, int value)
{
    if (sensor == NULL) {
        return;
    }
    sensor->temperature = value;
}

int main(void)
{
    struct Sensor room = { .temperature = 20 };
    set_temperature(&room, 26);
    printf("%d C\n", room.temperature);
    return 0;
}`, "26 C\n")}
      <p>C still passes by value: the parameter receives a <em>copy of the address</em>. That copied pointer reaches the original room object. Passing <code>room</code> by struct value instead would copy the struct and would not update the caller's fields.</p>
      <p>This tiny helper defines NULL as a no-op. In a real API, document that contract or return an error so callers can handle invalid input. NULL checks are only one part of pointer safety, covered next.</p>
      <h3>Try it</h3><p>Add a second sensor and call the helper with its address. Confirm that only the selected sensor changes.</p>`,
    quiz: [quiz("Why does set_temperature(&room, 26) change room?", ["C passes every struct by reference", "A copied pointer is used to access the original room"], 1, "All C arguments are passed by value. The copied address still refers to the original live object.")]
  },
  {
    id: "null-safety", track: "C foundations", title: "NULL is not a complete safety check", minutes: 8,
    summary: "Check for a missing pointer, but also think about lifetime, type, and bounds.",
    body: `${program(String.raw`#include <stdio.h>

int print_reading(const int *reading)
{
    if (reading == NULL) {
        fprintf(stderr, "Missing reading\n");
        return -1;
    }
    printf("Reading: %d\n", *reading);
    return 0;
}

int main(void)
{
    int value = 42;
    return print_reading(&value);
}`, "Reading: 42\n")}
      <p><code>NULL</code> is a null pointer constant, used to represent no object address. <code>if (reading != NULL)</code> and <code>if (reading)</code> test for a non-null pointer. <code>const int *</code> means this function cannot modify the pointed-to int through that pointer.</p>
      <div class="callout warning"><strong>Non-NULL does not mean valid.</strong> A dangling pointer to an expired local variable, freed memory, a wrong-type address, or an out-of-bounds address can be non-null. Dereferencing it can still be undefined behavior. Never dereference NULL. A NULL check cannot repair an uninitialized pointer either.</div>
      <p>The caller must supply a pointer to a live, accessible int. For a real sensor driver, lifetime and synchronization also matter when another thread can change or remove a device.</p>
      <h3>Try it</h3><p>Call <code>print_reading(NULL)</code> instead. The program should report "Missing reading" to standard error and return a failure status, without dereferencing NULL.</p>`,
    quiz: [quiz("A pointer is non-NULL. Is dereferencing it guaranteed safe?", ["Yes", "No"], 1, "Non-null is necessary in this example, but not sufficient. Lifetime, bounds, type, permissions, and concurrent access still matter.")]
  },
  {
    id: "binary", track: "C foundations", title: "Binary place values: 0 to 15 and beyond", minutes: 9,
    summary: "Each position is worth twice as much as the one to its right.",
    body: `<p>Decimal uses place values 1, 10, 100. Binary uses 1, 2, 4, 8, 16, 32, 64, 128. A bit is either 0 (do not include its place value) or 1 (include it). Bit positions are numbered from zero on the right.</p>
      ${code("Position:  3  2  1  0\nValue:     8  4  2  1\nBits:      1  0  1  1   = 8 + 2 + 1 = 11")}
      <table><caption>All four-bit patterns</caption><thead><tr><th>Decimal</th><th>Binary</th><th>Decimal</th><th>Binary</th></tr></thead><tbody>
      ${Array.from({ length: 8 }, (_, n) => `<tr><td>${n}</td><td><code>${n.toString(2).padStart(4, "0")}</code></td><td>${n + 8}</td><td><code>${(n + 8).toString(2).padStart(4, "0")}</code></td></tr>`).join("")}
      </tbody></table>
      <p>Four bits cover 0 through 15. The next value, 16, is <code>10000</code>: it needs a fifth bit. 31 is <code>11111</code>; 32 is <code>100000</code>. Leading zeros do not change the value.</p>
      <p>In portable C11 code, use decimal values or hexadecimal such as <code>0x0B</code> for 11. The <code>0b</code> binary literal prefix is not standard C11 (it became standard in C23; compilers may support it earlier as an extension).</p>
      <h3>Try it</h3><p>Use the <a href="https://itsnavin.github.io/learn-bits/" target="_blank" rel="noopener noreferrer">separate bit calculator</a> to turn on positions 4 and 1. The result should be 16 + 2 = 18.</p>`,
    quiz: [quiz("What is binary 10010 in decimal?", ["10", "18", "12"], 1, "The set bits are at positions 4 and 1: their values are 16 and 2. 16 + 2 = 18.")]
  },
  {
    id: "bitwise", track: "C foundations", title: "Bitwise AND, OR, and flags", minutes: 10,
    summary: "Inspect and set individual status bits without mixing them up with logical conditions.",
    body: `<p>Bitwise AND <code>&amp;</code> produces 1 at a position only if both bits are 1. Bitwise OR <code>|</code> produces 1 if either bit is 1.</p>
      ${code("           AND                 OR\n           1010 (10)           1010 (10)\n           0110 ( 6)           0110 ( 6)\n           ----                ----\n           0010 ( 2)           1110 (14)")}
      <p>AND, right to left: 0&amp;0=0, 1&amp;1=1, 0&amp;1=0, 1&amp;0=0. OR: 0|0=0, 1|1=1, 0|1=1, 1|0=1. Compare matching positions, not whole decimal digits.</p>
      ${program(String.raw`#include <stdio.h>

int main(void)
{
    unsigned int status = 10U;
    unsigned int ready = 1U << 1;
    if ((status & ready) != 0U) {
        printf("Ready bit is set\n");
    }
    status |= 1U;
    printf("Updated status: %u\n", status);
    return 0;
}`, "Ready bit is set\nUpdated status: 11\n")}
      <p><code>1U &lt;&lt; 1</code> shifts the unsigned value 1 one position left, making the mask 2. <code>status &amp; ready</code> gives 2 here, not 1; it is still true in an if because it is nonzero. <code>|=</code> sets the selected bits while preserving others. <code>%u</code> prints unsigned int.</p>
      <div class="callout warning">Use unsigned types for beginner bit operations. Shift counts must be smaller than the width of the promoted left operand. These normal variable examples are not permission to write arbitrary hardware registers; real registers may have special read/write semantics.</div>
      <p>Logical <code>&amp;&amp;</code> asks whether both operands are nonzero and short-circuits; bitwise <code>&amp;</code> combines their individual bits and evaluates both operands. Do not interchange them.</p>`,
    quiz: [quiz("What is 10 & 6, and is it true in if?", ["2, true", "1, true", "0, false"], 0, "1010 AND 0110 is 0010, decimal 2. Any nonzero integer is true in an if."),
      quiz("What is 10 | 6?", ["2", "14", "16"], 1, "1010 OR 0110 is 1110: 8 + 4 + 2 = 14.")]
  },
  {
    id: "vm-setup", track: "Linux drivers", title: "Prepare a safe Linux VM", minutes: 12,
    summary: "Kernel bugs can crash the whole machine. Prepare a disposable lab before loading any module.",
    body: `<div class="callout warning"><strong>VM only.</strong> Use a disposable Ubuntu 24.04 LTS x86-64 VM with a Linux 6.8 generic kernel for these labs. Take a snapshot before loading modules. Do not use your work computer's host kernel or a production server. Containers share their host kernel; they are not an equivalent safety boundary.</div>
      <p>Use a hypervisor supported by your machine, install Ubuntu from its <a href="https://ubuntu.com/download/desktop">official image</a>, and make sure you can restore a snapshot. Do not attach real sensors or pass through hardware yet. All lab commands below run <em>inside</em> that VM.</p>
      <h3>Prerequisites</h3><p>Finish C pointers, structs, arrays, functions, and bit flags first. Practice <code>pwd</code>, <code>ls</code>, <code>cd</code>, editing a file, and the compile/run commands. Learn that <code>sudo</code> executes with elevated privileges and should be used only for commands you understand.</p>
      ${code('uname -r\nsudo apt update\nsudo apt install build-essential linux-headers-$(uname -r)\ntest -d /lib/modules/$(uname -r)/build && echo "Headers found"')}
      <p>The running kernel must start with <code>6.8.</code> and its exact matching headers must be installed. The original Ubuntu 24.04 generic kernel is 6.8; newer installer images or HWE updates can use newer kernels. Do not assume "24.04" guarantees 6.8. Use a VM image with 6.8 or adapt and validate against your newer version before using these examples.</p>
      <p>Record the output of <code>uname -r</code>. If headers are unavailable, stop and resolve the matching-kernel package setup first. Do not build against an unrelated header directory and then force-load the module.</p>
      <p>Secure Boot may reject an unsigned module. For this isolated lab, configure the VM's Secure Boot setting appropriately or use Ubuntu's module-signing procedure. Do not weaken the host's security settings. Do not force an incompatible module to load.</p>
      <h3>Success check</h3><p>You have a restorable VM snapshot, a 6.8 kernel, matching headers, and a working C compiler. No module has been loaded yet.</p>`,
    quiz: [quiz("Is a container a safe substitute for this disposable kernel VM?", ["Yes, it has its own independent kernel", "No, it shares the host kernel"], 1, "A module can affect the shared host kernel. A restorable VM isolates this lab from your host much better.")]
  },
  {
    id: "kernel-space", track: "Linux drivers", title: "User space versus kernel space", minutes: 8,
    summary: "Your ordinary C program and a kernel driver run under very different rules.",
    body: `<p>Your C programs so far run in <strong>user space</strong>. They ask the kernel to do privileged work through system calls, such as opening a file. A driver runs in <strong>kernel space</strong>, where it can manage devices and a mistake can corrupt or crash the system.</p>
      <table><thead><tr><th>User program</th><th>Kernel module</th></tr></thead><tbody>
      <tr><td>main starts the program</td><td>Registered init and exit callbacks</td></tr>
      <tr><td>printf, standard C library</td><td>pr_info, kernel-provided APIs</td></tr>
      <tr><td>malloc/free (when needed)</td><td>Kernel allocation APIs and context rules</td></tr>
      <tr><td>Floating-point calculations permitted</td><td>No ordinary floating-point use in drivers</td></tr>
      <tr><td>Crash usually affects the process</td><td>Bug can affect the whole machine</td></tr>
      </tbody></table>
      <p>A module is not launched with <code>./module</code>. The kernel loads its code and calls registered functions. It has no standard C library and no normal user-space <code>main</code>.</p>
      <p>Use integer units, for example <code>int temperature_mc = 23750;</code> for 23.750 C. Specialized kernel floating-point support exists in constrained architecture-dependent contexts, but is not a general driver programming interface and is outside this course.</p>
      <div class="callout">C syntax is familiar, but rules about sleeping, memory ownership, user pointers, interrupts, and concurrency must be learned separately. A user pointer is not a trusted kernel pointer.</div>
      <h3>Try it</h3><p>Trace: a user program calls read → a system call reaches the kernel → the device's read callback supplies data → the kernel returns to user space.</p>`,
    quiz: [quiz("Which belongs in a normal kernel driver?", ["printf and double arithmetic", "pr_info and scaled integer readings", "A main function"], 1, "Use kernel logging and integer units. A kernel module does not link the user-space standard C library.")]
  },
  {
    id: "hello-module", track: "Linux drivers", title: "Your first module: hello and goodbye", minutes: 15,
    summary: "Build a tiny module, load it in the VM, inspect logs, and unload it.",
    body: `<p><strong>Target:</strong> Linux 6.8, Ubuntu x86-64 VM, matching headers. The complete source files are linked below. Download both into the same directory in your VM; do not copy HTML into a C file.</p>
      <div class="lab-links"><a href="labs/hello/hello.c" download>Download hello.c</a><a href="labs/hello/Makefile" download>Download Makefile</a></div>
      ${code(String.raw`#include <linux/init.h>
#include <linux/module.h>

static int __init hello_init(void)
{
    pr_info("learn_c_hello: hello\n");
    return 0;
}

static void __exit hello_exit(void)
{
    pr_info("learn_c_hello: goodbye\n");
}

module_init(hello_init);
module_exit(hello_exit);
MODULE_LICENSE("GPL");
MODULE_DESCRIPTION("Beginner hello module for Linux 6.8");`)}
      <p>Init returns 0 for success or a negative error code on failure. Exit releases resources acquired by a successful init. This module only logs messages, so it has no device resources to release. <code>static</code> keeps these names local to the source file; init/exit annotations tell the kernel how that code is used.</p>
      <h3>Makefile</h3>${code("obj-m += hello.o\nKDIR ?= /lib/modules/$(shell uname -r)/build\n\nall:\n\t$(MAKE) -C $(KDIR) M=$(CURDIR) modules\n\nclean:\n\t$(MAKE) -C $(KDIR) M=$(CURDIR) clean")}
      <p>The recipe lines must begin with a real tab, not spaces. Kbuild, the kernel build system, supplies the correct compiler options. Do not compile a module using the earlier standalone gcc command.</p>
      ${code("make\nsudo insmod hello.ko\nlsmod | grep '^hello '\nsudo dmesg | tail -n 20\nsudo rmmod hello\nsudo dmesg | tail -n 20\nmake clean")}
      <p>Expect "learn_c_hello: hello" after load and "learn_c_hello: goodbye" after unload. An out-of-tree-module taint message is expected for a locally built module; it is not the greeting. If loading fails, read the error and kernel logs. "Invalid module format" commonly means a kernel/build mismatch; signature errors can involve Secure Boot. Do not force-load or force-unload.</p>
      <h3>Try it</h3><p>Change only the greeting, rebuild, and repeat the load/unload cycle. If the module is already loaded, unload it normally before loading the rebuilt version.</p>`,
    quiz: [quiz("What should a successful module init function return?", ["0", "1", "Any positive number"], 0, "Return 0 for success. On failure return a suitable negative errno; unwind already-acquired resources before returning.")]
  },
  {
    id: "subsystems", track: "Linux drivers", title: "Driver categories and subsystems", minutes: 9,
    summary: "Choose the right kernel home for a device instead of making every device a custom file.",
    body: `<p>A driver connects a device to a kernel subsystem. A subsystem supplies conventions and interfaces so applications can use similar devices consistently.</p>
      <table><thead><tr><th>Kind of device</th><th>Typical kernel home</th></tr></thead><tbody>
      <tr><td>Buttons and keyboards</td><td>Input subsystem</td></tr>
      <tr><td>Temperature monitor</td><td>hwmon (hardware monitoring)</td></tr>
      <tr><td>ADC, accelerometer, sampled sensor</td><td>IIO (Industrial I/O)</td></tr>
      <tr><td>Network adapter</td><td>Networking subsystem</td></tr>
      <tr><td>Storage device</td><td>Block subsystem</td></tr>
      <tr><td>Simple byte-oriented teaching interface</td><td>Character device</td></tr>
      </tbody></table>
      <p>A bus describes <em>how the device is connected</em>; a subsystem describes <em>what it does</em>. An I2C temperature chip can be an I2C client device managed by an hwmon driver. Not every driver is a loadable module: drivers may also be built into the kernel.</p>
      <p>Our next character-device lab is intentionally a small teaching device with no hardware. A real temperature sensor should normally use hwmon or IIO, not invent a new user ABI. ABI means the interface that user programs depend on.</p>
      <h3>Try it</h3><p>Pick a real sensor and read its datasheet. Identify the bus separately from its measurement function. Do not write hardware-control code yet.</p>`,
    quiz: [quiz("Is I2C the same kind of classification as hwmon?", ["Yes, both mean temperature", "No: I2C is a bus, hwmon is a subsystem"], 1, "Connection and function are separate. A driver may participate in both.")]
  },
  {
    id: "character-device", track: "Linux drivers", title: "A read-only character device", minutes: 18,
    summary: "Expose a fixed teaching reading as /dev/learn_sensor and read it like a file.",
    body: `<p><strong>Target: Linux 6.8 in the VM.</strong> Download the complete file and Makefile. This lab registers a <code>miscdevice</code>, a simpler way to create a character device using the kernel's shared miscellaneous major number and a dynamic minor number.</p>
      <div class="lab-links"><a href="labs/sensor/learn_sensor.c" download>Download learn_sensor.c</a><a href="labs/sensor/Makefile" download>Download Makefile</a></div>
      <p>The first stage is the <em>read-only idea</em>: a device callback supplies a fixed text reading with <code>simple_read_from_buffer</code>. The downloaded final lab adds a carefully bounded write callback in the next lesson.</p>
      ${code(String.raw`/* Conceptual read-only callback; full lab is linked above. */
static ssize_t sensor_read(struct file *file, char __user *user,
                           size_t count, loff_t *ppos)
{
    static const char text[] = "25000\n";

    return simple_read_from_buffer(user, count, ppos,
                                   text, sizeof(text) - 1);
}`)}
      <p><code>ssize_t</code> is a signed byte-count type so negative errors can be returned. <code>count</code> is how many bytes the caller requests. <code>ppos</code> tracks this open file's position. The helper handles partial reads, user-copy failures, and end of file. The terminating zero is excluded from the data length.</p>
      <p>The full lab's file operations include <code>.owner = THIS_MODULE</code>, which pins the module while a file is open; its init checks <code>misc_register</code>'s result, and exit uses <code>misc_deregister</code>. The device is registered only after its state is ready.</p>
      ${code("make\nsudo insmod learn_sensor.ko\nls -l /dev/learn_sensor\nsudo cat /dev/learn_sensor\nsudo rmmod learn_sensor")}
      <p>Before writes, expect <code>25000</code>, meaning 25.000 C. The file mode is deliberately 0600: only root has read/write permissions by default. Do not make it world-writable. If the node does not appear, inspect <code>sudo dmesg</code> and your VM's devtmpfs/udev setup rather than guessing a major/minor number.</p>
      <h3>Why not cdev and class_create yet?</h3><p>Manual registration needs device numbers, cdev setup, a class/device, and reverse-order cleanup on <em>every</em> failure path. miscdevice avoids that boilerplate for this lab. For later manual labs, note that Linux 6.4 changed <code>class_create(THIS_MODULE, "name")</code> to <code>class_create("name")</code>. Copying old tutorial code into 6.8 is not automatically compatible.</p>`,
    quiz: [quiz("Why must a read callback reach end of file?", ["So cat can finish instead of reading forever", "So the module unloads automatically", "So permissions disappear"], 0, "Read returns 0 at EOF. The position-aware helper handles that for this bounded buffer.")]
  },
  {
    id: "character-write", track: "Linux drivers", title: "Add writes, errors, and synchronization", minutes: 20,
    summary: "Let user space set an integer reading without trusting user pointers or racing other callers.",
    body: `<p>The complete <a href="labs/sensor/learn_sensor.c" download>learn_sensor.c lab</a> accepts one integer in millidegrees Celsius per write, between -40000 and 125000. It is simulated device state in a real kernel module, <em>not a physical sensor</em>.</p>
      <p>The write callback rejects empty or oversized input. <code>kstrtoint_from_user</code> copies and parses user input rather than directly dereferencing a user-space address. Invalid text and out-of-range readings return negative errors. A successful write updates the value while holding a mutex.</p>
      <p>The read callback takes the same mutex, formats a snapshot into a local buffer, unlocks, and uses <code>simple_read_from_buffer</code> to copy it to user space. A mutex protects shared state against simultaneous reads/writes. It may sleep; these file callbacks run in a context where sleeping is allowed. Do not use this locking pattern in a hard interrupt handler.</p>
      <div class="callout">Each read call gets a coherent snapshot. Separate partial reads can observe different snapshots if another writer changes the value between calls. This small lab does not promise a stable per-open snapshot; that requires per-open storage and additional lifetime handling.</div>
      ${code("make\nsudo insmod learn_sensor.ko\nprintf '31000\\n' | sudo tee /dev/learn_sensor\nsudo cat /dev/learn_sensor\nprintf 'not-a-number\\n' | sudo tee /dev/learn_sensor\nprintf '999999\\n' | sudo tee /dev/learn_sensor\nsudo cat /dev/learn_sensor\nsudo rmmod learn_sensor\nmake clean")}
      <p><code>tee</code> echoes what it writes. After the valid write, a fresh <code>cat</code> should read 31000. Invalid writes must fail and preserve the previous reading. Use sudo on tee, not only on printf: <code>sudo echo ... &gt; /dev/...</code> does not elevate the shell's redirection.</p>
      <p>The module checks registration failure and returns it. There is no dynamically allocated state to leak. An open file pins the module; unload normally after closing readers. Never force unload. The lab includes a <a href="labs/sensor/test_sensor.py" download>VM smoke-test script</a> for reads, invalid writes, partial reads, and concurrent access; run it only after loading the module in your disposable VM.</p>
      <h3>Try it</h3><p>Test -40000 and 125000 (accepted), then -40001 and 125001 (rejected). Check that rejected writes do not change the stored reading.</p>`,
    quiz: [quiz("Why is a non-NULL user pointer not safe to dereference in a driver?", ["User memory is untrusted and may not be accessible; use user-copy helpers", "Every user pointer is always NULL", "A mutex turns it into a kernel pointer"], 0, "Use the correct user-access helpers and handle their errors. A NULL test or mutex does not validate user memory."),
      quiz("Why protect the shared reading with the same mutex in both callbacks?", ["To synchronize concurrent readers and writers", "To make floating point legal", "To automatically validate input"], 0, "The lock coordinates access to shared state. Input validation and pointer handling remain separate responsibilities.")]
  },
  {
    id: "buses", track: "Linux drivers", title: "Hardware buses and your next steps", minutes: 12,
    summary: "Move from a software-only teaching device toward real sensors using the right subsystem.",
    body: `<table><thead><tr><th>Connection</th><th>Beginner mental model</th></tr></thead><tbody>
      <tr><td>I2C</td><td>Shared clock/data bus with addressed devices</td></tr>
      <tr><td>SPI</td><td>Clocked transfers with chip selection</td></tr>
      <tr><td>USB</td><td>Enumerated devices with descriptors and endpoints</td></tr>
      <tr><td>PCI / PCIe</td><td>Enumerated devices, mapped resources, interrupts and often DMA</td></tr>
      <tr><td>Platform devices</td><td>Often on-board hardware described by firmware, ACPI or Device Tree</td></tr>
      </tbody></table>
      <p>A real bus driver typically has a match table, a <code>probe</code> callback when a device is bound, and removal/resource management when it is unbound. Device binding is different from the module's overall load/unload lifecycle; one module may handle multiple devices.</p>
      <p>Next, read a sensor datasheet: supply voltage, signal levels, bus address, register layout, units, and timing. Never connect a 5 V signal to a 3.3 V-only input. Do not probe arbitrary registers, map physical memory, or wire devices by guesswork.</p>
      <h3>A sensible next path</h3><ol>
      <li>Practice C ownership, error paths, bit masks, and concurrency in the software-only VM lab.</li>
      <li>Read an existing small hwmon or IIO driver in the exact kernel source version you are learning.</li>
      <li>Learn device matching, probe/remove, managed resources, and regmap before adapting a supported sensor on a disposable lab board.</li>
      <li>Learn interrupts, workqueues, locking contexts, and power management before asynchronous hardware work. DMA needs another round of memory and lifetime study.</li></ol>
      <p>Kernel internal APIs are not a stable cross-version interface. For example, I2C callback signatures in older tutorials differ from Linux 6.8. Read the exact version's headers and in-tree drivers; do not mechanically transplant code.</p>
      <h3>Trusted references</h3><ul>
      <li><a href="https://docs.kernel.org/6.8/kbuild/modules.html">Linux 6.8: building external modules</a></li>
      <li><a href="https://docs.kernel.org/6.8/driver-api/index.html">Linux 6.8 driver API guide</a></li>
      <li><a href="https://docs.kernel.org/6.8/hwmon/index.html">Hardware monitoring</a> and <a href="https://docs.kernel.org/6.8/driver-api/iio/index.html">IIO</a></li>
      <li><a href="https://github.com/torvalds/linux/tree/v6.8/drivers">In-tree drivers at v6.8</a></li></ul>
      <div class="callout">You do not need to know all of this today. Being able to explain one reading, one pointer, and one error path clearly is useful progress.</div>`,
    quiz: [quiz("What should normally happen before writing a custom sensor ABI?", ["Pick the right existing subsystem and study the datasheet", "Write arbitrary registers until output appears", "Use floating point inside an interrupt"], 0, "Understand the hardware and reuse the kernel's established subsystem interfaces. That is safer and more maintainable.")]
  }
];
