# Dynamic Programming Algorithm Notes

This document details the mathematical formulations, state representations, recurrence relations, and algorithmic trade-offs for all problems implemented in Dynamic Programming Playground.

---

## 1. Fibonacci Sequence

### Problem Description
Compute the $n$-th Fibonacci number $F(n)$, where each term is the sum of the two preceding terms.

### Formal Formulation
- **State Definition**: $F(n)$ is the value of the $n$-th Fibonacci number.
- **Base Cases**:
  - $F(0) = 0$
  - $F(1) = 1$
- **Recurrence Relation**:
  $$F(n) = F(n - 1) + F(n - 2) \quad \text{for } n \ge 2$$

### Strategy Comparison
- **Tabulation (Bottom-Up)**:
  - Fills an array sequentially from $i = 2$ up to $n$.
  - State evaluations: $n + 1$.
  - Time Complexity: $O(n)$, Space: $O(n)$ (reducible to $O(1)$).
- **Memoization (Top-Down)**:
  - Recursively requests $F(n)$, checking a hash table or cache array before branching.
  - State evaluations: $n + 1$.
  - Time Complexity: $O(n)$, Space: $O(n)$ stack + memo table.
- **Naive Recursion**:
  - Pure divide-and-conquer without caching.
  - State evaluations: $2 \cdot F(n + 1) - 1 \approx O(\phi^n)$ where $\phi \approx 1.618$.
  - Example: for $n = 10$, Naive evaluates 177 recursive calls, whereas Tabulation evaluates only 11 states!

---

## 2. Climbing Stairs

### Problem Description
You are climbing a staircase with $n$ steps. Each time you can climb either 1 step or 2 steps. In how many distinct ways can you reach the top?

### Formal Formulation
- **State Definition**: $\text{ways}(n)$ is the count of distinct step combinations to reach step $n$.
- **Base Cases**:
  - $\text{ways}(1) = 1$ (single move $[1]$)
  - $\text{ways}(2) = 2$ (moves $[1, 1]$ or $[2]$)
- **Recurrence Relation**:
  $$\text{ways}(n) = \text{ways}(n - 1) + \text{ways}(n - 2) \quad \text{for } n \ge 3$$
- **Insight**: Any valid climb to step $n$ must arrive either from step $n - 1$ (via a 1-step hop) or from step $n - 2$ (via a 2-step hop). By the Addition Rule of Combinatorics, the total ways is their sum.

---

## 3. 0/1 Knapsack Problem

### Problem Description
Given $n$ items, each with weight $w_i$ and value $v_i$, and a knapsack with maximum weight capacity $W$, determine the maximum value that can be placed in the knapsack without exceeding capacity. Each item may be chosen at most once (0 or 1).

### Formal Formulation
- **State Definition**: $dp[i][w]$ represents the maximum attainable value considering only the first $i$ items (indices $1 \dots i$) with a remaining weight capacity $w$.
- **Base Cases**:
  - $dp[0][w] = 0$ for all $0 \le w \le W$ (0 items available $\implies$ value 0)
  - $dp[i][0] = 0$ for all $0 \le i \le n$ (zero capacity $\implies$ value 0)
- **Recurrence Relation**:
  $$dp[i][w] = \begin{cases} dp[i - 1][w] & \text{if } w_i > w \\ \max\Big(dp[i - 1][w],\; v_i + dp[i - 1][w - w_i]\Big) & \text{if } w_i \le w \end{cases}$$

### Decision Analysis
At cell $dp[i][w]$, two mutually exclusive decisions are compared:
1. **Exclude Item $i$**: The knapsack remains at capacity $w$, utilizing the optimal configuration from the previous $i - 1$ items: $dp[i - 1][w]$.
2. **Include Item $i$**: Item $i$ contributes value $v_i$ and consumes weight $w_i$. The remaining capacity $w - w_i$ is filled optimally using items $1 \dots i - 1$: $v_i + dp[i - 1][w - w_i]$.

### Optimal Selection Backtracking
Once the DP matrix is populated up to $dp[n][W]$, the optimal subset of item indices is recovered in $O(n)$ time:
- Start at $i = n, w = W$.
- If $dp[i][w] \neq dp[i - 1][w]$, item $i$ was included: record index $i - 1$, and update $w \leftarrow w - w_i$.
- Decrement $i \leftarrow i - 1$ until $i = 0$ or $w = 0$.
