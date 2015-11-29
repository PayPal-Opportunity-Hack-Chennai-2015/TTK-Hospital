function editButtonPressed(event){
    data = JSON.parse($(event.target).attr("data-info"));
    $('#addNewRecordForm').modal('show');
    $("#personName").val(data.person.name);
    $("#personPhone").val(data.person.phone);
    $("#supportName").val(data.immediateFamily.name);
    $("#supportPhone").val(data.immediateFamily.phone);
    console.log(toDateYYYYMMDD(data.entryDate));
    $("#entryDate").val(toDateYYYYMMDD(data.entryDate));
    $("#exitDate").val(toDateYYYYMMDD(data.exitDate));
    $("#bucket").val(data.bucket);
    $("#status").val(data.status);
    $("#languagePreference").val(data.languagePreference);
    $("#action").val("edit");
    $("#id").val(data.id);
}


    toBeDeletedId = null;
    function deleteRecord(id){
        console.log("Inside function deleteRecord");
        console.log("ID is " + id);
        $('#deleteRecordModal').modal('show'); 
        toBeDeletedId = id;
    }

    function deleteAjax(){
        console.log("Inside Delete");
        console.log("ID value is "+toBeDeletedId);
          var query = "id=" + toBeDeletedId;
          $.ajax({
          url: "/deleteRecord?" + query,
          //force to handle it as text
          dataType: "text",

          success: function(data){
                location.reload();
          },
          error: function() {
                $('#errorDeleteRecordModal').modal('show'); 
          }

        });
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
    var callHistoryList = $("#callHistoryModal .callHistoryList tbody");

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
                  { "data": "id", "visible": false},
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
                  { "data": "status"},
                  { "data": "languagePreference"},
                  {
                    "data": "",
                    "render": function ( data, type, full, meta ) {
                            return '<a class="btn btn-info btn-sm btn-call" href=#/' + full[0] + '>' + 'Calls' + '</a>';
                    }
                  },
                  { "data": "",
                    "render": function ( data, type, full, meta ) {
            //           return '<a class="btn btn-info btn-sm btn-edit" href=#/' + full[0] + '>' + 'Edit' + '</a>';
              //          console.log(full);
               //         console.log(full["id"]); 
                        return "<a class='btn btn-info btn-sm' href=# onclick=editButtonPressed(event) data-info='" + JSON.stringify(full) + "'>" + 'Edit' + '</a>' + '<a class="btn btn-danger btn-sm" href=# onclick=deleteRecord("' + full["id"] + '")>Delete</a>';
                    }
                  }

              ],
              "iDisplayLength": 15,
            });
            $("#ttkdata .btn-call").on("click", function(event) {
                event.preventDefault();
                callHistoryList.empty();
                var tr = $(this).closest("tr");
                var patientData = dataTable.row(tr).data()
                var patientCalls = dataTable.row(tr).data().calls;
                var calls = patientCalls.map(function(call) {
                    return "<tr><td>" + (new Date(call.time)) + "</td><td>" + call.response + "</td></tr>";
                });
                console.log(calls);
                callHistoryList.append(calls.join());
                $('#phoneNumberPK').val(patientData.person.phone);
                $('#callHistoryModal').modal('toggle');
            });  
            $("#ttkdata .btn-edit").on("click", function(event) {
                event.preventDefault();
                alert("Edit");
            });
        }
    });
});
