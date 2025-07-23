window.solver = (function() {
  // Recursive solution with animation support
  async function solve(n, from, to, aux, callbacks = {}) {
    if (n <= 0) return;
    
    await solve(n - 1, from, aux, to, callbacks);
    
    if (callbacks.onMove) {
      await callbacks.onMove(from, to);
    }
    
    await solve(n - 1, aux, to, from, callbacks);
  }

  // Iterative solution (non-recursive)
  function solveIterative(n, from, to, aux) {
    const stack = [];
    stack.push({ n, from, to, aux, stage: 0 });
    
    const moves = [];
    
    while (stack.length > 0) {
      const current = stack.pop();
      
      if (current.n === 1) {
        moves.push({ from: current.from, to: current.to });
      } else {
        if (current.stage === 0) {
          // Push in reverse order of execution
          current.stage = 1;
          stack.push(current);
          stack.push({ n: current.n - 1, from: current.from, to: current.aux, aux: current.to, stage: 0 });
        } else if (current.stage === 1) {
          moves.push({ from: current.from, to: current.to });
          stack.push({ n: current.n - 1, from: current.aux, to: current.to, aux: current.from, stage: 0 });
        }
      }
    }
    
    return moves;
  }

  // Auto-solve function that uses the solver
  async function autoSolve(disks, callbacks = {}) {
    await solve(disks, 0, 2, 1, callbacks);
  }

  return {
    solve,
    solveIterative,
    autoSolve
  };
})();