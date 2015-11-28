function editButtonPressed(data){
    data = JSON.parse(data);
    $('#addNewRecordForm').modal('show');
    $("#personName").val(data.person.name);
    $("#personPhone").val(data.person.phone);
    $("#supportName").val(data.immediateFamily.name);
    $("#supportPhone").val(data.immediateFamily.phone);
    console.log(toDateYYYYMMDD(data.entryDate));
    $("#entryDate").val(toDateYYYYMMDD(data.entryDate));
    $("#exitDate").val(toDateYYYYMMDD(data.exitDate));
    $("#bucket").val(data.bucket);
    $("#languagePreference").val(data.languagePreference);
    $("#action").val("edit");
    $("#id").val(data.id);
}

function toDate(secs)
{
  var t = new Date(1970,0,1);
  t.setSeconds(secs);
  return ("0" + t.getDate()).slice(-2) + "/" + ("0" + (t.getMonth() + 1)).slice(-2) + "/" + t.getFullYear();
}

function toDateYYYYMMDD(secs)
{
  var t = new Date(1970,0,1);
  t.setSeconds(secs);
  var day = t.getDate();
  return t.getFullYear() + "-" + ("0" + (t.getMonth() + 1)).slice(-2) + "-" + ("0" + t.getDate()).slice(-2);
}

$(document).ready(function() {

    console.log("Hello");

    $.ajax({
        url: "/fetchAllData",
        //force to handle it as text
        dataType: "text",
        success: function(data) {
            if(JSON.parse(data)["success"] == false && JSON.parse(data)["msg"] == "Authentication Required"){
                location.href = "/login.html";
            }
            var data = JSON.parse(data);
            var dataTable;
            console.log(data);
            dataTable = $("#ttkdata").DataTable({
              "data": data,
              "order": [],
              "columns": [
                  { "data": "person.name" },
                  { "data": "person.phone"},
                  { "data": "immediateFamily.name"},
                  { "data": "immediateFamily.phone"},
                  { "data": "entryDate",
                    "render": function ( data, type, full, meta ) {
                      return toDate(data);
                    }
                  },
                  { "data": "exitDate",
                    "render": function ( data, type, full, meta ) {
                      return toDate(data);
                    }
                  },
                  { "data": "bucket"},
                  { "data": "failedContactCount"},
                  { "data": "languagePreference"},
                  {
                    "data": "",
                    "render": function ( data, type, full, meta ) {
                            return '<a class="btn btn-info btn-sm" href=#/' + full[0] + '>' + 'Calls' + '</a>';
                    }
                  },
                  { "data": "",
                    "render": function ( data, type, full, meta ) {
                        console.log(full);
                        return "<a class='btn btn-info btn-sm' href=# onclick=editButtonPressed(\'" + JSON.stringify(full) + "\')>" + 'Edit' + '</a>' + '<a class="btn btn-danger btn-sm" href=#/' + full[0] + '>' + 'Delete' + '</a>';
                    }
                  }

              ],
              "iDisplayLength": 15,
            });
        }
    });   
});
