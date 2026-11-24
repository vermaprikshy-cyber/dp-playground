import React from 'react';
import { HelpCircle, Clock, Zap } from 'lucide-react';

export const LearnDP: React.FC = () => {
  return (
    <div className="container" style={{ maxWidth: '960px' }}>
      <div style={{ marginBottom: '2.5rem', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.75rem' }}>
          Dynamic Programming Mastery Guide
        </h1>
        <p style={{ fontSize: '1.05rem', color: '#475569', lineHeight: 1.6 }}>
          Everything you need to master DP concepts, defend your solutions in exam vivas, and explain table state transitions.
        </p>
      </div>

      {/* The 2 Core Prerequisites of DP */}
      <section className="panel" style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#0f172a', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Zap size={22} color="var(--primary)" />
          <span>The Two Pillars of Dynamic Programming</span>
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
          <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1e40af', marginBottom: '0.5rem' }}>
              1. Optimal Substructure
            </h3>
            <p style={{ fontSize: '0.875rem', color: '#334155', lineHeight: 1.6 }}>
              A problem has optimal substructure if an optimal solution to the overall problem contains optimal solutions to its subproblems.
            </p>
            <div style={{ marginTop: '0.75rem', fontSize: '0.8rem', color: '#64748b' }}>
              <strong>Example:</strong> In 0/1 Knapsack, the best combination using items $1..i$ with capacity $w$ depends directly on optimal sub-knapsacks using items $1..(i-1)$.
            </div>
          </div>

          <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f766e', marginBottom: '0.5rem' }}>
              2. Overlapping Subproblems
            </h3>
            <p style={{ fontSize: '0.875rem', color: '#334155', lineHeight: 1.6 }}>
              A problem has overlapping subproblems when a recursive approach would solve the exact same subproblems repeatedly instead of generating new ones.
            </p>
            <div style={{ marginTop: '0.75rem', fontSize: '0.8rem', color: '#64748b' }}>
              <strong>Example:</strong> In Fibonacci, $F(5)$ calls $F(4)$ and $F(3)$, while $F(4)$ also calls $F(3)$. Without caching, $F(3)$ is computed twice.
            </div>
          </div>
        </div>
      </section>

      {/* Memoization vs Tabulation */}
      <section className="panel" style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#0f172a', marginBottom: '1rem' }}>
          Top-Down (Memoization) vs Bottom-Up (Tabulation)
        </h2>

        <div style={{ overflowX: 'auto' }}>
          <table className="dp-table" style={{ width: '100%', textAlign: 'left' }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left' }}>Aspect</th>
                <th style={{ textAlign: 'left' }}>Top-Down (Memoization)</th>
                <th style={{ textAlign: 'left' }}>Bottom-Up (Tabulation)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ fontWeight: 600 }}>Execution Style</td>
                <td>Recursive with lookup table (cache).</td>
                <td>Iterative loops filling an array or matrix.</td>
              </tr>
              <tr>
                <td style={{ fontWeight: 600 }}>State Evaluation</td>
                <td>Computes only reachable states needed by the query.</td>
                <td>Systematically computes every state from base cases upward.</td>
              </tr>
              <tr>
                <td style={{ fontWeight: 600 }}>Overhead</td>
                <td>Function recursion stack frame overhead.</td>
                <td>Zero recursion overhead; sequential memory access.</td>
              </tr>
              <tr>
                <td style={{ fontWeight: 600 }}>Space Optimization</td>
                <td>Hard to optimize space (entire memo table is kept).</td>
                <td>Often compressible (e.g. 2 rows or single array).</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Viva Exam Questions and Answers */}
      <section className="panel" style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#0f172a', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <HelpCircle size={22} color="var(--primary)" />
          <span>Viva & Oral Exam Questions to Prepare</span>
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <details style={{ background: '#f8fafc', padding: '1rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
            <summary style={{ fontWeight: 700, cursor: 'pointer', color: '#0f172a' }}>
              Q1: What is a DP state, and how is it defined for 0/1 Knapsack?
            </summary>
            <p style={{ marginTop: '0.75rem', fontSize: '0.875rem', color: '#334155', lineHeight: 1.6 }}>
              A <strong>state</strong> is the minimal set of parameters that uniquely captures a subproblem configuration.
              For 0/1 Knapsack, the state is $dp[i][w]$, representing the maximum total value attainable considering only the first $i$ items with a remaining weight capacity of $w$.
            </p>
          </details>

          <details style={{ background: '#f8fafc', padding: '1rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
            <summary style={{ fontWeight: 700, cursor: 'pointer', color: '#0f172a' }}>
              Q2: Why does memoization avoid repeated subproblems?
            </summary>
            <p style={{ marginTop: '0.75rem', fontSize: '0.875rem', color: '#334155', lineHeight: 1.6 }}>
              Memoization wraps the recurrence function with a cache. Before performing recursive branching, it checks if the state key exists in the table. If found, it returns the cached answer in $O(1)$ time, pruning that entire branch of the recursion tree.
            </p>
          </details>

          <details style={{ background: '#f8fafc', padding: '1rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
            <summary style={{ fontWeight: 700, cursor: 'pointer', color: '#0f172a' }}>
              Q3: Why is tabulation $O(n \times W)$ for this Knapsack formulation?
            </summary>
            <p style={{ marginTop: '0.75rem', fontSize: '0.875rem', color: '#334155', lineHeight: 1.6 }}>
              There are $(n + 1) \times (W + 1)$ unique cells in the DP matrix. Each cell performs a constant $O(1)$ number of operations (taking the max of excluding the item vs including it). Hence, the total time is proportional to $(n \times W)$ operations.
            </p>
          </details>

          <details style={{ background: '#f8fafc', padding: '1rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
            <summary style={{ fontWeight: 700, cursor: 'pointer', color: '#0f172a' }}>
              Q4: What is the difference between time complexity and measured execution time?
            </summary>
            <p style={{ marginTop: '0.75rem', fontSize: '0.875rem', color: '#334155', lineHeight: 1.6 }}>
              <strong>Time complexity</strong> (Big-O) is a mathematical asymptotic bound on how the number of primitive operations scales as input sizes approach infinity.
              <strong>Measured execution time</strong> is the elapsed wall-clock duration in milliseconds on physical hardware, which includes CPU clock frequency, cache hits/misses, operating system scheduling jitter, and I/O overhead.
            </p>
          </details>

          <details style={{ background: '#f8fafc', padding: '1rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
            <summary style={{ fontWeight: 700, cursor: 'pointer', color: '#0f172a' }}>
              Q5: How do you guarantee the displayed table matches the actual C++ algorithm?
            </summary>
            <p style={{ marginTop: '0.75rem', fontSize: '0.875rem', color: '#334155', lineHeight: 1.6 }}>
              The frontend never simulates or recomputes the algorithm. The compiled C++ binary executes the algorithm and emits an authoritative trace event list. The React frontend is a deterministic trace player that renders the table strictly from the received event stream.
            </p>
          </details>
        </div>
      </section>

      {/* 5-Minute Demo Script */}
      <section className="panel">
        <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#0f172a', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Clock size={22} color="#0d9488" />
          <span>5-Minute Classroom Demo Script</span>
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ borderLeft: '3px solid var(--primary)', paddingLeft: '1rem' }}>
            <strong>0:00 – 0:30: Introduction</strong>
            <p style={{ fontSize: '0.85rem', color: '#475569' }}>
              State the mission: Dynamic programming is tough when treated as static tables. This tool reveals intermediate states and their dependencies in real time.
            </p>
          </div>

          <div style={{ borderLeft: '3px solid var(--primary)', paddingLeft: '1rem' }}>
            <strong>0:30 – 1:30: Fibonacci & Climbing Stairs</strong>
            <p style={{ fontSize: '0.85rem', color: '#475569' }}>
              Run Fibonacci with Tabulation, then compare with Memoization and Naive Recursion. Point out that all three return 55 for F(10), but recursion evaluates 177 states whereas DP evaluates only 11 states!
            </p>
          </div>

          <div style={{ borderLeft: '3px solid var(--primary)', paddingLeft: '1rem' }}>
            <strong>1:30 – 3:00: 0/1 Knapsack 2D Matrix</strong>
            <p style={{ fontSize: '0.85rem', color: '#475569' }}>
              Run the textbook Knapsack example (weights [1, 3, 4, 5], values [1, 4, 5, 7], capacity 7). Step into cell dp[3][5], showing how it reads dp[2][5] and dp[2][1], making the include/exclude decision visible.
            </p>
          </div>

          <div style={{ borderLeft: '3px solid var(--primary)', paddingLeft: '1rem' }}>
            <strong>3:00 – 4:00: Complexity & Metrics Comparison</strong>
            <p style={{ fontSize: '0.85rem', color: '#475569' }}>
              Highlight the distinct metrics: Big-O asymptotic analysis vs measured execution milliseconds.
            </p>
          </div>

          <div style={{ borderLeft: '3px solid var(--primary)', paddingLeft: '1rem' }}>
            <strong>4:00 – 5:00: Architecture & Tests</strong>
            <p style={{ fontSize: '0.85rem', color: '#475569' }}>
              Explain the architecture: React UI + FastAPI backend + C++ engine with complete separation of concerns and passing test suites across all layers.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
