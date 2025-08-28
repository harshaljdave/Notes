document.addEventListener('DOMContentLoaded', () => {
    const folderModal = document.getElementById('modifyFolderModal')
    folderModal.addEventListener('show.bs.modal', event => {
        folderlist()
    })
});

function CreateFolder() {
    const FolderName = document.getElementById('FolderName').value

    fetch('/folders',{
        method:"POST",
        body:JSON.stringify({
            foldername:FolderName
        })
    })
    .then(response => response.json())
    .then(res => {
    })
    location.reload()

}

const folderlist = () => {
    const noteID = JSON.parse(document.getElementById('currentNote').textContent)
    fetch(`/folderList?note_id=${noteID}`)
    .then(res => res.json())
    .then(res => {
        const folders = res.folders
        const FolderID = res.current_folder
        folders.forEach(folder => {
            const button = document.createElement("button")
            button.setAttribute("id",`folder${folder.id}`)
            button.addEventListener('click', () => {
                editFolder(folder.id,noteID)
            })
            // Set the button to be selected if it is the selected folder
            if (FolderID == folder.id){

                button.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-check-circle" viewBox="0 0 16 16">'
                    + '<path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"/>'
                    + '<path d="m10.97 4.97-.02.022-3.473 4.425-2.093-2.094a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-1.071-1.05"/>'
                    + '</svg>'
                button.className = "btn btn-outline-success"
                button.setAttribute("select-data","true")
            } else {// If it is not the selected folder, set the button to be unselected
                button.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-plus-circle" viewBox="0 0 16 16">'
                    + '<path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"/>'
                    + '<path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4"/>'
                    + '</svg>'
                button.className = "btn btn-outline-primary"
            }

            const div = document.createElement("div")
            div.className = "d-flex justify-content-between my-3"
            div.setAttribute("id",folder.id)
            div.innerText = folder.name
            div.appendChild(button)
            document.getElementById("Formlist").appendChild(div)
        });
    })
}

const editFolder = (id,NoteID) => {
    const noteID = JSON.parse(document.getElementById('currentNote').textContent)

    const csrftoken = Cookies.get('csrftoken')
    
    const selected_folder_ele = document.querySelector('[select-data="true"]')
    //regex to extract only numbers from id
    const regex = /\d+/;    
    const current_folder_id = selected_folder_ele ? regex.exec(selected_folder_ele.id)[0] : null;
    
    //IF current folder is unselected
    if(id == current_folder_id ){

        fetch("/folderList", {
            method:"PUT",
            headers: {
                'X-CSRFToken': csrftoken,
            },
            body:JSON.stringify({
                "removeID":current_folder_id,
                "noteID":NoteID
            })
        }).then(res => res.json())
        .then(res => {
            
            if(res.status == 200){
                button = document.getElementById(`folder${id}`)
                button.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-plus-circle" viewBox="0 0 16 16">'
                    + '<path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"/>'
                    + '<path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4"/>'
                    + '</svg>'
                button.className = "btn btn-outline-primary"
                button.removeAttribute("select-data")
            }else{
                console.log("ERROR")
            }
        })

    //If different folder is selected
    }else{

        fetch("/folderList", {
            method:"PUT",
            headers: {
                'X-CSRFToken': csrftoken,
            },
            body:JSON.stringify({
                "addID":id,
                "removeID":current_folder_id,
                "noteID":NoteID
            })
        }).then(res => res.json())
        .then(res => {
            
            if(res.status == 200){

                if(selected_folder_ele){
                    
                    selected_folder_ele.removeAttribute("select-data")
                    selected_folder_ele.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-plus-circle" viewBox="0 0 16 16">'
                    + '<path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"/>'
                    + '<path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4"/>'
                    + '</svg>'
                    selected_folder_ele.className = "btn btn-outline-primary"
                    
                }
                
                select_button = document.getElementById(`folder${id}`)
                select_button.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-check-circle" viewBox="0 0 16 16">'
                + '<path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"/>'
                + '<path d="m10.97 4.97-.02.022-3.473 4.425-2.093-2.094a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-1.071-1.05"/>'
                + '</svg>'
                select_button.className = "btn btn-outline-success"
                select_button.setAttribute("select-data","true")
            } else {
                console.log("ERROR")
            }
        })
    }
}

const deleteFolder = (folderId) => {
    if (!confirm("Are you sure you want to delete this folder?")) return;
    const csrftoken = Cookies.get('csrftoken');
    fetch(`/folderdelete/${folderId}`, {
        method: 'DELETE',
        headers: {
            'X-CSRFToken': csrftoken,
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(res => {
        if (res.success) {
            toastfolder("Folder", { message: "Folder deleted successfully."},"danger");
            setTimeout(() => {window.location.reload()}, 3000)
        } else {
            alert(res.error || "Failed to delete folder.");
        }
    })
    .catch(() => {
        alert("An error occurred while deleting the folder.");
    });
}

function toastfolder(title, res, type = "success") {
    // Set toast color class
    const toastEl = document.getElementById("liveToast");
    const toastBody = document.getElementById("toast-body");
    const toastHeader = toastEl.querySelector(".toast-header strong");

    // Remove any previous bg class and add the new one
    toastEl.className = `toast text-bg-${type} border-0`;

    // Set the title and message
    if (toastHeader) toastHeader.textContent = title;
    if (toastBody) toastBody.innerHTML = res.message || res.Created || res.Empty || res.error || "Action completed.";

    // Show the toast using Bootstrap's JS API
    const bsToast = bootstrap.Toast.getOrCreateInstance(toastEl);
    bsToast.show();
}