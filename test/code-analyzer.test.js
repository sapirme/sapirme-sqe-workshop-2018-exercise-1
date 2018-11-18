import assert from 'assert';
import {createTable} from '../src/js/code-analyzer';

describe('test1', () => {
    it('is parsing an empty function correctly', () => {
        assert.deepEqual(
            createTable(''),
            []
        );
    });
    it('is parsing a variable declaration correctly 1', () => {
        assert.deepEqual(
            createTable('let a = 1;'),
            [{Line: 1, Type: 'variable declaration', Name: 'a', Condition: null, Value: 1}]
        );
        assert.deepEqual(
            createTable('var a = 1;'),
            [{Line: 1, Type: 'variable declaration', Name: 'a', Condition: null, Value: 1}]
        );
    });
});

describe ('test2', () =>{
    it('is parsing a variable declaration correctly 2', () => {
        assert.deepEqual(
            createTable('let a = 1, b, c = 9;'),
            [{Line: 1, Type: 'variable declaration', Name: 'a', Condition: null, Value: 1}, {Line: 1, Type: 'variable declaration', Name: 'b', Condition: null, Value: null}, {Line: 1, Type: 'variable declaration', Name: 'c', Condition: null, Value: 9}]
        );
        assert.deepEqual(
            createTable('let a = 1+d, b, c = 9;'),
            [{Line: 1, Type: 'variable declaration', Name: 'a', Condition: null, Value: '1 + d'}, {Line: 1, Type: 'variable declaration', Name: 'b', Condition: null, Value: null}, {Line: 1, Type: 'variable declaration', Name: 'c', Condition: null, Value: 9}]
        );
    });
});
describe ('test3', () => {
    it('is parsing a function declaration correctly', () => {
        assert.deepEqual(
            createTable('function f(){}'),
            [{Line: 1, Type: 'function declaration', Name: 'f', Condition: null, Value: null}]
        );
        assert.deepEqual(
            createTable('function f(X,Y){}'),
            [{Line: 1, Type: 'function declaration', Name: 'f', Condition: null, Value: null}, {Line: 1, Type: 'variable declaration', Name: 'X', Condition: null, Value: null}, {Line: 1, Type: 'variable declaration', Name: 'Y', Condition: null, Value: null}]
        );
        assert.deepEqual(
            createTable('function f(X,Y){}\n function t(){}'),
            [{Line: 1, Type: 'function declaration', Name: 'f', Condition: null, Value: null}, {Line: 1, Type: 'variable declaration', Name: 'X', Condition: null, Value: null}, {Line: 1, Type: 'variable declaration', Name: 'Y', Condition: null, Value: null}, {Line: 2, Type: 'function declaration', Name: 't', Condition: null, Value: null}]
        );
    });
});

describe ('test4', () =>{
    it('is parsing a assignment expression correctly', () => {
        assert.deepEqual(
            createTable('x=1;'),
            [{Line: 1, Type: 'assignment expression', Name: 'x', Condition: null, Value: 1}]
        );
        assert.deepEqual(
            createTable('x=1;\n y=x+2;'),
            [{Line: 1, Type: 'assignment expression', Name: 'x', Condition: null, Value: 1},
                {Line: 2, Type: 'assignment expression', Name: 'y', Condition: null, Value: 'x + 2'}]
        );
        assert.deepEqual(
            createTable('x=1;\ny=(5-x)/2;'),
            [{Line: 1, Type: 'assignment expression', Name: 'x', Condition: null, Value: 1},
                {Line: 2, Type: 'assignment expression', Name: 'y', Condition: null, Value: '5 - x / 2'}]
        );
    });
});

describe ('test5', () =>{
    it('is parsing a while expression correctly', () => {
        assert.deepEqual(
            createTable('while (x != 0){}'),
            [{Line: 1, Type: 'while statement', Name: null, Condition: 'x != 0', Value: null}]
        );
        assert.deepEqual(
            createTable('while (x != 0){\n x=x-1;\n }'),
            [{Line: 1, Type: 'while statement', Name: null, Condition: 'x != 0', Value: null},
                {Line: 2, Type: 'assignment expression', Name: 'x', Condition: null, Value: 'x - 1'}]
        );
        assert.deepEqual(
            createTable('while (x < 10 && x > 3){\n x=x-1;\n }'),
            [{Line: 1, Type: 'while statement', Name: null, Condition: 'x < 10 && x > 3', Value: null},
                {Line: 2, Type: 'assignment expression', Name: 'x', Condition: null, Value: 'x - 1'}]
        );
    });
});

describe ('test6', () =>{
    it('is parsing a for expression correctly 1', () => {
        assert.deepEqual(
            createTable('for (i=0; i<20 ; i++){}'),
            [{Line: 1, Type: 'for statement', Name: null, Condition: 'i = 0; i < 20; i++', Value: null}]
        );
        assert.deepEqual(
            createTable('for (i=20; i>0 ; --i){}'),
            [{Line: 1, Type: 'for statement', Name: null, Condition: 'i = 20; i > 0; --i', Value: null}]
        );
        assert.deepEqual(
            createTable('for (let i=0; i<20 || flag ; i++)\n x=x+y;'),
            [{Line: 1, Type: 'for statement', Name: null, Condition: 'let i = 0; i < 20 || flag; i++', Value: null},
                {Line: 2, Type: 'assignment expression', Name: 'x', Condition: null, Value: 'x + y'}]
        );
    });
});

describe ('test7', () =>{
    it('is parsing a for expression correctly 2', () => {
        assert.deepEqual(
            createTable('for (let i=0,z; i<20 ; i++)\n x=x+y;'),
            [{Line: 1, Type: 'for statement', Name: null, Condition: 'let i = 0,z; i < 20; i++', Value: null},
                {Line: 2, Type: 'assignment expression', Name: 'x', Condition: null, Value: 'x + y'}]
        );
        assert.deepEqual(
            createTable('for (i=0,z; i<20 ; i++, z=z+1)\n x=x+y;'),
            [{Line: 1, Type: 'for statement', Name: null, Condition: 'i = 0,z; i < 20; i++,z = z + 1', Value: null},
                {Line: 2, Type: 'assignment expression', Name: 'x', Condition: null, Value: 'x + y'}]
        );
    });
});

describe ('test8', () => {
    it('is parsing a if expression correctly 2', () => {
        assert.deepEqual(
            createTable('if (flag==false)\n{\n x=100;\n }'),
            [{Line: 1, Type: 'if statement', Name: null, Condition: 'flag == false', Value: null},
                {Line: 3, Type: 'assignment expression', Name: 'x', Condition: null, Value: 100}]
        );
        assert.deepEqual(
            createTable('if (flag==false)\n x=100;'),
            [{Line: 1, Type: 'if statement', Name: null, Condition: 'flag == false', Value: null},
                {Line: 2, Type: 'assignment expression', Name: 'x', Condition: null, Value: 100}]
        );
    });
});

describe ('test9', () => {
    it('is parsing a if else expression correctly 1', () => {
        assert.deepEqual(
            createTable('if (x >= 7)\n{\n x=2*x*(x+1);\n }\n else {\n x=3*x;\n}'),
            [{Line: 1, Type: 'if statement', Name: null, Condition: 'x >= 7', Value: null},
                {Line: 3, Type: 'assignment expression', Name: 'x', Condition: null, Value: '2 * x * x + 1'},
                {Line: 6, Type: 'assignment expression', Name: 'x', Condition: null, Value: '3 * x'}]
        );
        assert.deepEqual(
            createTable('if (x >= 7)\n{\n x=2*x*(x+1);\n }\n else if (x ==7 ){\n x=3*x;\n}'),
            [{Line: 1, Type: 'if statement', Name: null, Condition: 'x >= 7', Value: null},
                {Line: 3, Type: 'assignment expression', Name: 'x', Condition: null, Value: '2 * x * x + 1'},
                {Line: 5, Type: 'else if statement', Name: null, Condition: 'x == 7', Value: null},
                {Line: 6, Type: 'assignment expression', Name: 'x', Condition: null, Value: '3 * x'}]
        );
    });
});

describe ('test10', () => {
    it('is parsing a if else expression correctly 2', () => {
        assert.deepEqual(
            createTable('if (x >= 7)\n{\n x=2*x*(x+1);\n }\n else if (x ==7 ){\n x=3*x;\n}\n else x=3;'),
            [{Line: 1, Type: 'if statement', Name: null, Condition: 'x >= 7', Value: null}, {Line: 3, Type: 'assignment expression', Name: 'x', Condition: null, Value: '2 * x * x + 1'},
                {Line: 5, Type: 'else if statement', Name: null, Condition: 'x == 7', Value: null}, {Line: 6, Type: 'assignment expression', Name: 'x', Condition: null, Value: '3 * x'},
                {Line: 8, Type: 'assignment expression', Name: 'x', Condition: null, Value: 3}]
        );
        assert.deepEqual(
            createTable('if (x >= 7)\n{\n x=2*x*(x+1);\n }\n else if (x ==7 ){\n x=3*x;\n}\n else if (x==0)\n x=0;'),
            [{Line: 1, Type: 'if statement', Name: null, Condition: 'x >= 7', Value: null},
                {Line: 3, Type: 'assignment expression', Name: 'x', Condition: null, Value: '2 * x * x + 1'}, {Line: 5, Type: 'else if statement', Name: null, Condition: 'x == 7', Value: null},
                {Line: 6, Type: 'assignment expression', Name: 'x', Condition: null, Value: '3 * x'}, {Line: 8, Type: 'else if statement', Name: null, Condition: 'x == 0', Value: null},
                {Line: 9, Type: 'assignment expression', Name: 'x', Condition: null, Value: 0}]
        );
    });
});

describe ('test11', () => {
    it('is parsing a return statement correctly ', () => {
        assert.deepEqual(
            createTable('function f (a,b){\nreturn a+b;\n}'),
            [{Line: 1, Type: 'function declaration', Name: 'f', Condition: null, Value: null},
                {Line: 1, Type: 'variable declaration', Name: 'a', Condition: null, Value: null},
                {Line: 1, Type: 'variable declaration', Name: 'b', Condition: null, Value: null},
                {Line: 2, Type: 'return statement', Name: null, Condition: null, Value: 'a + b'}]
        );
        assert.deepEqual(
            createTable('function f (a,b){\nlet z=a*2;\nreturn a+b, z;\n}'),
            [{Line: 1, Type: 'function declaration', Name: 'f', Condition: null, Value: null},
                {Line: 1, Type: 'variable declaration', Name: 'a', Condition: null, Value: null},
                {Line: 1, Type: 'variable declaration', Name: 'b', Condition: null, Value: null},
                {Line: 2, Type: 'variable declaration', Name: 'z', Condition: null, Value: 'a * 2'},
                {Line: 3, Type: 'return statement', Name: null, Condition: null, Value: 'a + b,z'}]
        );
    });
});

describe ('test12', () => {
    it('is parsing a mix correctly 1', () => {
        assert.deepEqual(
            createTable('function binarySearch(X, V, n){\nlet low, high, mid;\nlow = 0;\nhigh = n - 1;\nwhile (low <= high) {\nmid = (low + high)/2;\n' +
                'if (X < V[mid])\nhigh = mid - 1;\nelse if (X > V[mid])\nlow = mid + 1;\nelse\nreturn mid;\n}\nreturn -1;\n}'),
            [{Line: 1, Type: 'function declaration', Name: 'binarySearch', Condition: null, Value: null}, {Line: 1, Type: 'variable declaration', Name: 'X', Condition: null, Value: null},
                {Line: 1, Type: 'variable declaration', Name: 'V', Condition: null, Value: null}, {Line: 1, Type: 'variable declaration', Name: 'n', Condition: null, Value: null},
                {Line: 2, Type: 'variable declaration', Name: 'low', Condition: null, Value: null}, {Line: 2, Type: 'variable declaration', Name: 'high', Condition: null, Value: null},
                {Line: 2, Type: 'variable declaration', Name: 'mid', Condition: null, Value: null}, {Line: 3, Type: 'assignment expression', Name: 'low', Condition: null, Value: 0},
                {Line: 4, Type: 'assignment expression', Name: 'high', Condition: null, Value: 'n - 1'}, {Line: 5, Type: 'while statement', Name: null, Condition: 'low <= high', Value: null},
                {Line: 6, Type: 'assignment expression', Name: 'mid', Condition: null, Value: 'low + high / 2'}, {Line: 7, Type: 'if statement', Name: null, Condition: 'X < V[mid]', Value: null},
                {Line: 8, Type: 'assignment expression', Name: 'high', Condition: null, Value: 'mid - 1'}, {Line: 9, Type: 'else if statement', Name: null, Condition: 'X > V[mid]', Value: null},
                {Line: 10, Type: 'assignment expression', Name: 'low', Condition: null, Value: 'mid + 1'},
                {Line: 12, Type: 'return statement', Name: null, Condition: null, Value: 'mid'},
                {Line: 14, Type: 'return statement', Name: null, Condition: null, Value: '-1'}]
        );
    });
});


