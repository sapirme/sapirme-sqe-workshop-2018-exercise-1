import * as esprima from 'esprima';
import * as escodegen from 'escodegen';

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
    let valFor = escodegen.generate(exp.init);
    if (valFor.substr(valFor.length-1) === ';')
        valFor=valFor+' '+escodegen.generate(exp.test)+'; '+escodegen.generate(exp.update);
    else valFor=valFor+'; '+escodegen.generate(exp.test)+'; '+escodegen.generate(exp.update);
    array.push(createLine(exp.loc.start.line,
        'for statement',
        null,
        valFor,
        null));
    array=array.concat(func[exp.body.type](exp.body));
    return array;
}

function handleWhileStatement(exp){
    let array=[];
    array.push(createLine(exp.loc.start.line,
        'while statement',
        null,
        escodegen.generate(exp.test),
        null));
    array=array.concat(func[exp.body.type](exp.body));
    return array;
}

function handleReturnStatement(exp){
    return createLine(exp.loc.start.line,
        'return statement',
        null,
        null,
        escodegen.generate(exp.argument));
}

function handleVariableDeclarator(exp){
    if (exp.init!=null){
        return createLine(exp.loc.start.line,
            'variable declaration',
            escodegen.generate(exp.id),
            null,
            escodegen.generate(exp.init));
    }
    else {
        return createLine(exp.loc.start.line,
            'variable declaration',
            escodegen.generate(exp.id),
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
        escodegen.generate(ifState.test),
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
        escodegen.generate(ifState.test),
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
        'assignment expression', escodegen.generate(exp.left)
        ,null,
        escodegen.generate(exp.right));
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

function createTable(codeToParse){
    let parsedCode = parseCode(codeToParse);
    let array=[];
    for (let i=0; i<parsedCode.body.length; i++ ){
        array=array.concat(func[parsedCode.body[i].type](parsedCode.body[i]));
    }
    return array;
}




