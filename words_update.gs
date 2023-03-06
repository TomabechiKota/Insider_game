var excelFolderId = "12DJXsrgQy3hh2SN8uEoNKc8uB7gwyia8";
var source_folder = DriveApp.getFolderById(excelFolderId);

function wordsUpdate(){
  var newFileId = DriveApp.getFolderById(excelFolderId).getFiles().next().getId();
  var Words_List = Get_Words_List(newFileId);
  var Agenda_List = Get_Agenda_List(newFileId);
  postScoreUpdate_insider(Words_List);
  postScoreUpdate_ito(Agenda_List);
}


function Get_Words_List(newId){
  var dataArray = [];
  var newSS = SpreadsheetApp.openById(newId);
  var newSheet = newSS.getSheetByName("insider");
  var col = newSheet.getLastRow();
  var newValues = newSheet.getRange(1,1,col).getValues();
  for(var i = 0; i < col; i++){
    dataArray.push(newValues[i][0]);
  }
  return dataArray;
}

function Get_Agenda_List(newId){
  var dataArray = [];
  var newSS = SpreadsheetApp.openById(newId);
  var newSheet = newSS.getSheetByName("ito");
  var col = newSheet.getLastRow();
  var newValues = newSheet.getRange(1,1,col).getValues();
  for(var i = 0; i < col; i++){
    dataArray.push(newValues[i][0]);
  }
  return dataArray;
}

function postScoreUpdate_insider(data){
    var emb = {
      "fields": data
    };
    var json = {
      'type':'words',
      'debug':'false',
      'content': JSON.stringify(emb)
    };
    sendGlitch(GLITCH_URL, json);
}
function postScoreUpdate_ito(data){
    var emb = {
      "fields": data
    };
    var json = {
      'type':'agenda',
      'debug':'false',
      'content': JSON.stringify(emb)
    };
    sendGlitch(GLITCH_URL, json);
}