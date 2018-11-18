import * as esprima from 'esprima';
export {parseCode,createTable};
const parseCode = (codeToParse) => {
    return esprima.parseScript(codeToParse, {loc: true});
};

const func={
    'FunctionDeclaration' : handleFunctionDeclaration,
    'BlockStatement': handleBlockStatement,
    'ExpressionStatement' : handleExpressionStatement,
    'AssignmentExpression' : handleAssignmentExpression,
    'IfStatement' :handleIfStatement,
    'VariableDeclaration' : handleVariableDeclaration,
    'VariableDeclarator' : handleVariableDeclarator,
    'ReturnStatement' : handleReturnStatement,
    'WhileStatement' : handleWhileStatement,
    'ForStatement' : handleForStatement
};

let val={
    'Literal' : handleLiteral,
    'BinaryExpression': handleBinaryOrLogicalExpression,
    'Identifier' : handleIdentifier,
    'LogicalExpression' : handleBinaryOrLogicalExpression,
    'MemberExpression' : handleMemberExpression,
    'UnaryExpression' : handleUnaryExpression,
    'SequenceExpression' : handleSequenceExpression,
    'AssignmentExpression' : handleAssignmentExpressionVal,
    'UpdateExpression' : handleUpdateExpression,
    'VariableDeclarator' :handleVariableDeclaratorVal
};

function createLine(line,type,name,cond,value){
    return{
        Line: line,
        Type: type,
        Name: name,
        Condition: cond,
        Value: value
    };
}

function handleForStatement(exp){
    let array=[];
    let valFor=getValOfForInit(exp.init)+'; '+val[exp.test.type](exp.test)+'; '+val[exp.update.type](exp.update);
    array.push(createLine(exp.loc.start.line,
        'for statement',
        null,
        valFor,
        null));
    array=array.concat(func[exp.body.type](exp.body));
    return array;
}

function getValOfForInit (exp){
    let ans='';
    if ('VariableDeclaration' === exp.type)
        ans = ans + exp.kind + ' ' + makeVarDeclr(exp.declarations);
    if ('SequenceExpression' === exp.type)
        ans = ans + val[exp.type](exp);
    if ('AssignmentExpression' === exp.type)
        ans=ans+val[exp.type](exp);
    return ans;
}

function makeVarDeclr(exp){
    let ans='';
    for (let i=0; i<exp.length; i++){
        ans = ans + val[exp[i].type](exp[i]);
        if (i<exp.length-1)
            ans=ans+',';
    }
    return ans;
}

function handleWhileStatement(exp){
    let array=[];
    array.push(createLine(exp.loc.start.line,
        'while statement',
        null,
        val[exp.test.type](exp.test),
        null));
    array=array.concat(func[exp.body.type](exp.body));
    return array;
}

function handleReturnStatement(exp){
    return createLine(exp.loc.start.line,
        'return statement',
        null,
        null,
        val[exp.argument.type](exp.argument));
}

function handleVariableDeclarator(exp){
    if (exp.init!=null){
        return createLine(exp.loc.start.line,
            'variable declaration',
            val[exp.id.type](exp.id),
            null,
            val[exp.init.type](exp.init));
    }
    else {
        return createLine(exp.loc.start.line,
            'variable declaration',
            val[exp.id.type](exp.id),
            null,
            null);
    }
}

function handleVariableDeclaration(exp){
    let array=[];
    for (let i=0; i<exp.declarations.length; i++){
        array=array.concat(func[exp.declarations[i].type](exp.declarations[i]));
    }
    return array;
}

function handleIfStatement(ifState){
    let array=[];
    array.push(createLine(ifState.loc.start.line,
        'if statement',
        null,
        val[ifState.test.type](ifState.test),
        null));
    array=array.concat(func[ifState.consequent.type](ifState.consequent));
    if (ifState.alternate!=null && 'IfStatement' === ifState.alternate.type){
        array=array.concat(handleElseIfStatement(ifState.alternate));
    }
    else if (ifState.alternate!=null){
        array=array.concat(func[ifState.alternate.type](ifState.alternate));
    }
    return array;
}

function handleElseIfStatement (ifState) {
    let array=[];
    array.push(createLine(ifState.loc.start.line,
        'else if statement',
        null,
        val[ifState.test.type](ifState.test),
        null));
    array=array.concat(func[ifState.consequent.type](ifState.consequent));
    if (ifState.alternate!=null && 'IfStatement' === ifState.alternate.type){
        array=array.concat(handleElseIfStatement(ifState.alternate));
    }
    else if (ifState.alternate!=null){
        array=array.concat(func[ifState.alternate.type](ifState.alternate));
    }
    return array;
}

function handleExpressionStatement (exp){
    return func[exp.expression.type](exp.expression);
}
function handleAssignmentExpression(exp){
    return createLine(exp.loc.start.line,
        'assignment expression',val[exp.left.type](exp.left)
        ,null,
        val[exp.right.type](exp.right));
}

function handleBlockStatement (exp){
    let array=[];
    for (let i=0; i<exp.body.length; i++){
        array=array.concat(func[exp.body[i].type](exp.body[i]));
    }
    return array;
}

function handleFunctionDeclaration(funcDec){
    let array=[];
    array.push(createLine(funcDec.loc.start.line, 'function declaration', funcDec.id.name,null,null));
    array=array.concat(handleParams(funcDec.params));
    array=array.concat(func[funcDec.body.type](funcDec.body));
    return array;
}

function handleParams(paramArray){
    let array=[];
    for (let i=0; i<paramArray.length; i++){
        let obj= createLine(paramArray[i].loc.start.line,'variable declaration',paramArray[i].name,null,null);
        array.push(obj);
    }
    return array;
}

function handleLiteral(exp){
    return exp.value.toString();
}
function handleIdentifier(exp){
    return exp.name;
}
function handleBinaryOrLogicalExpression(exp){
    return val[exp.left.type](exp.left)+' '+exp.operator+' '+val[exp.right.type](exp.right);
}
function handleMemberExpression(exp) {
    return val[exp.object.type](exp.object) + '[' + val[exp.property.type](exp.property) + ']';
}

function handleUnaryExpression(exp){
    return exp.operator+val[exp.argument.type](exp.argument);
}

function handleSequenceExpression(exp){
    let ans='';
    for (let i=0; i<exp.expressions.length; i++){
        ans=ans+val[exp.expressions[i].type](exp.expressions[i]);
        if (i<exp.expressions.length-1)
            ans=ans+',';
    }
    return ans;
}

function handleAssignmentExpressionVal(exp){
    return val[exp.left.type](exp.left)+' '+exp.operator+' '+val[exp.right.type](exp.right);
}

function handleUpdateExpression(exp){
    if (exp.prefix){
        return exp.operator+val[exp.argument.type](exp.argument);
    }
    else{
        return val[exp.argument.type](exp.argument)+exp.operator;
    }
}

function handleVariableDeclaratorVal(exp){
    let ans = val[exp.id.type](exp.id);
    if (exp.init!=null){
        ans=ans+' = '+val[exp.init.type](exp.init);
    }
    return ans;
}

function createTable(codeToParse){
    let parsedCode = parseCode(codeToParse);
    let array=[];
    for (let i=0; i<parsedCode.body.length; i++ ){
        array=array.concat(func[parsedCode.body[i].type](parsedCode.body[i]));
    }
    return array;
}




