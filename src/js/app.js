import $ from 'jquery';
import {createTable} from './code-analyzer';

$(document).ready(function () {
    $('#codeSubmissionButton').click(() => {
        let codeToParse = $('#codePlaceholder').val();
        let obj=createTable(codeToParse);
        var tbody = document.getElementById('tbody');
        tbody.innerHTML=makeFirstRow();
        for (var i = 0; i < obj.length; i++) {
            tbody.innerHTML += makeRow(obj[i]);
        }
    });
});

function makeRow(row){
    let ans='<tr>\n' +
        '<td>'+row.Line+'</td>\n' +
        '<td>'+row.Type+'</td>\n';
    if (row.Name!=null)
        ans=ans+'<td>'+row.Name+'</td>\n' ;
    else ans=ans+'<td></td>\n' ;
    if (row.Condition!=null)
        ans=ans+'<td>'+row.Condition+'</td>\n' ;
    else ans=ans+'<td></td>\n' ;
    if (row.Value!=null)
        ans=ans+'<td>'+row.Value+'</td>\n' ;
    else ans=ans+'<td></td>\n' ;

    return ans+'</tr>';

}

function makeFirstRow(){
    return '<tr>\n' +
        '<th>Line</th>\n' +
        '<th>Type</th>\n' +
        '<th>Name</th>\n' +
        '<th>Condition</th>\n' +
        '<th>Value</th>\n' +
        '</tr>';
}
