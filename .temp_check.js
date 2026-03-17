import fs from 'fs';
const content = fs.readFileSync('e:\\Saif-RMS-POS-Frontend-Dashboard\\src\\app\\(admin)\\page.tsx', 'utf-8');

function countBalance(str, open, close) {
    let balance = 0;
    for (let char of str) {
        if (char === open) balance++;
        if (char === close) balance--;
    }
    return balance;
}

console.log('Braces {} balance:', countBalance(content, '{', '}'));
console.log('Parentheses () balance:', countBalance(content, '(', ')'));
console.log('Square [] balance:', countBalance(content, '[', ']'));
console.log('Angle <> balance (rough):', countBalance(content, '<', '>'));
