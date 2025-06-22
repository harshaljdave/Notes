document.addEventListener('DOMContentLoaded', () => {
    
        const accessModal = document.getElementById('EditAccessModal');
    if (accessModal) {
        accessModal.addEventListener('show.bs.modal', function () {
            loadAccessList();
        });
    }
    
    const tagModal = document.getElementById('newNoteModal');
    if (tagModal) {
        tagModal.addEventListener('show.bs.modal', loadTagsInModal);
    }

    const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]')
    const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl))

    showNoTagsIfEmpty()

    const favButton = document.getElementById("favourite")
    const unfavButton = document.getElementById("unfavourite")
    document.getElementById("check").innerText.includes("F") === false ? (favButton.style.display="none",unfavButton.style.display="inline-block")
                                                             :(favButton.style.display="inline-block",unfavButton.style.display="none");
    
});

const BaseURL = "http://127.0.0.1:8000/"

function ViewNote(id) {
    window.location.assign(BaseURL +"note/" + id)
}

function EditNote() {
    const divele = getTags()

    const tagdiv = document.getElementById('tagdiv')
    if (tagdiv) {
        tagdiv.style.display = "none"
        const editTagdiv = document.getElementById("editTagdiv")
        editTagdiv.style.display = "block"
        editTagdiv.appendChild(divele)    
    }
    

    const titleElement = document.getElementById("ViewTitle")
    title = titleElement.textContent.trim()
    titleElement.style.display = "none"
    document.getElementById("EditHead").style.display = "block"
    document.getElementById("EditTitle").value = title

    const NoteContentElement = document.getElementById("ViewContent")
    NoteContent = NoteContentElement.innerText
    NoteContentElement.style.display = "none"
    const EditElement = document.getElementById("EditContent")
    EditElement.style.display = "block"
    EditElement.value = NoteContent.replace(/[^\S\n]+/g, '');
    EditElement.focus()

    document.getElementById("editButton").style.display = "none"
    document.getElementById("saveButton").style.display = "inline-block"
}

function getTags() {
    const div = document.createElement("div")
    div.setAttribute("id","TaglistDiv")
    // Add flex-wrap for better mobile layout
    div.className = "mt-2 d-flex flex-wrap gap-2"
    const Tagspan = document.getElementsByName("AppliedTag")
    const tagValues = []
    Tagspan.forEach(element => {
        tagValues.push(element.innerText)
    });
    fetch('/tags')
    .then(response => response.json())
    .then(res => {

        res.forEach(ele => {
            //checkbox button
            const chkbx = document.createElement("input");
            chkbx.setAttribute("type","checkbox")
            chkbx.setAttribute("name","Tags")
            chkbx.setAttribute("id",`tag${ele.id}`)
            chkbx.setAttribute("value",`${ele.tag}`)
            //if tag included then check it
            if (tagValues.includes(ele.tag)) {
                chkbx.setAttribute("checked","checked")
            }
            chkbx.className = "btn-check"

            //Label for checkbox button 
            const label = document.createElement("label");
            label.setAttribute("for",`tag${ele.id}`)
            label.innerHTML = `${ele.tag}`
            // Add responsive padding and margin
            label.className = "btn btn-outline-info m-1 px-2 py-1"

            div.appendChild(chkbx)
            div.appendChild(label)

        });
    })
    return div;
}

function cancelEdit() {
    const titleElement = document.getElementById("ViewTitle");
    titleElement.style.display = "block";
    document.getElementById("EditHead").style.display = "none";

    const contentElement = document.getElementById("ViewContent");
    contentElement.style.display = "block";
    document.getElementById("EditContent").style.display = "none";

    document.getElementById("editButton").style.display = "inline-block";
    document.getElementById("saveButton").style.display = "none";

    // Reset tag display
    const tagdiv = document.getElementById('tagdiv')
    if (tagdiv) {
        tagdiv.style.display = "block";
    }
    
    const editTagdiv = document.getElementById("editTagdiv");
    if(editTagdiv){
        editTagdiv.style.display = "none";
        editTagdiv.replaceChildren()
    }
}

function SaveEditNote() {

    const csrftoken = Cookies.get('csrftoken')
    const Title = document.getElementById("EditTitle").value.trim()    
    const Content = document.getElementById("EditContent").value.replace(/[^\S\n]+/g, '');
    const regex = /\d+/;
    id = window.location.pathname.match(regex)[0]

    let checkedTags = []
    let chk = document.getElementsByName("Tags")
    chk.forEach(ele => {
        if (ele.checked) {
            checkedTags.push(ele.value)
        }
    });

    
    fetch(`/note/${id}`, {
        method: "PUT",
        headers: {'X-CSRFToken': csrftoken},
        body: JSON.stringify({
            title: Title,
            content: Content,
            tags: checkedTags
        })
    })
        .then(response => response.json())
        .then(res => {
            let note = res.note
            //Title
            const titleElement = document.getElementById("ViewTitle")
            titleElement.textContent = note.title
            titleElement.style.display = "block"
            document.getElementById("EditHead").style.display = "none"

            //Content
            const NoteContentElement = document.getElementById("ViewContent")
            NoteContentElement.innerText = note.content
            NoteContentElement.style.display = "block"
            document.getElementById("EditContent").style.display = "none"

            //Editor and edit time Details
            document.getElementById("EditorData").innerText=`Last edit by ${ res.EditBy } on ${ res.EditTimeStamp }`

            //Tags
            const editTagdiv = document.getElementById("editTagdiv")
            if(editTagdiv){
                editTagdiv.style.display = "none"
                //Remove existing tags from editTagdiv
                editTagdiv.replaceChildren()
            }
            
            //Remove existing tags from tagdiv
            const tagdiv = document.getElementById('tagdiv')
            if (tagdiv) {
                tagdiv.replaceChildren()
                
                checkedTags.forEach(tag => {
                    
                    const span = document.createElement("span")
                    span.setAttribute("name","AppliedTag")
                    span.innerText = tag
                    span.className = "badge rounded-pill text-bg-primary me-1"
                    tagdiv.appendChild(span)
                    
                });
                
                tagdiv.style.display = "block"
            }
        })
    
    document.getElementById("editButton").style.display = "inline-block"
    document.getElementById("saveButton").style.display = "none"
}

function favunfav(NoteID,ButtonID) {
    const csrftoken = Cookies.get('csrftoken')

    if(ButtonID == "unstar"){
        document.getElementById(`Note${NoteID}`).remove()
    }else{
    const favButton = document.getElementById("favourite")
    const unfavButton = document.getElementById("unfavourite")

    ButtonID == "favourite" ? (favButton.style.display = "none", unfavButton.style.display = "inline-block")
                : (favButton.style.display = "inline-block", unfavButton.style.display = "none")
    
    }
    
    fetch(`/FavUnfav/${NoteID}`,{
        method : "PUT",
        headers: {'X-CSRFToken': csrftoken},
        mode: 'same-origin'
    }).then(response => response.json())
     .then(res => {
        console.log(res)
     })
}

function myTags() {
    if(!document.getElementById("TaglistDiv")){
        const ele = getTags()
        document.getElementById("tagModal").appendChild(ele)
    }
}

function editTags(type){
    const csrftoken = Cookies.get('csrftoken')
    const edit_tag= "edit_tag"

// ! turns 0 (index value of "D" in delete) to True/1 and -1 ((Not found value for 'create) to false/0
    if (!type.search('delete')) {
        // True i.e. button == delete

        var tagdiv = document.getElementById("TaglistDiv")
        var taglist = tagdiv.querySelectorAll(".btn-check")
        let selectedtags = []

        taglist.forEach(chkbox => {
            if (chkbox.checked == true){
                selectedtags.push(chkbox.id)
                tagdiv.querySelector(`label[for="${chkbox.id}"]`).remove()
                chkbox.remove()
            }

        });
        
        fetch('/tags',{
            method : "DELETE",
            headers : {'X-CSRFToken': csrftoken},
            body : JSON.stringify({
                taglist : selectedtags
            })
        }).then(res => res.json())
        .then( res => {
            
            toast(edit_tag,res)
            setTimeout(() => {window.location.reload()}, 3000)
        })
    
    }else{
        // False i.e. button == create
        let tagname = document.getElementById("newtag").value
        if(tagname.trim() === ""){
            toast(edit_tag,{Empty : "Tag name cannot be empty"})
            return
        }
        console.log("first")
        fetch('/tags',{
            method : "POST",
            headers: {'X-CSRFToken': csrftoken},
            body : JSON.stringify({
                tag : tagname
            })
        }).then(res => res.json())
        .then( res => {
            if(res.Created){

                const TagListDiv = document.getElementById("TaglistDiv")
                
                if(!TagListDiv){
                    // Create div element, add tag and append inside Mytags modal
                    // if it does not exist i.e. user's first tag
                    
                    //Create div
                    const div = document.createElement("div")
                    div.setAttribute("id","TaglistDiv")
                    div.className = "mt-2 d-flex flex-wrap gap-2 justify-content-center justify-content-md-start"
                    
                    //Create checkbox
                    const chkbx = document.createElement("input");
                    chkbx.setAttribute("type","checkbox")
                    chkbx.setAttribute("name","Tags")
                    chkbx.setAttribute("id",`tag${res.pk}`)
                    chkbx.setAttribute("value",`${res.Tag}`)
                    chkbx.className = "btn-check"
                    
                    //Create label
                    const label = document.createElement("label");
                    label.setAttribute("for",`tag${res.pk}`)
                    label.innerHTML = `${res.Tag}`
                    // Add touch-friendly padding on mobile
                    label.className = "btn btn-outline-info m-1 px-2 py-1"
                    
                    //Append to Div
                    div.appendChild(chkbx)
                    div.appendChild(label)
                    
                    //Append div in tag modal's body
                    document.getElementById("tagModal").appendChild(div)
                    
                }else{
                    //Create checkbox
                    const chkbx = document.createElement("input");
                    chkbx.setAttribute("type","checkbox")
                    chkbx.setAttribute("name","Tags")
                    chkbx.setAttribute("id",`tag${res.pk}`)
                    chkbx.setAttribute("value",`${res.Tag}`)
                    chkbx.className = "btn-check"
                    
                    //Create label
                    const label = document.createElement("label");
                    label.setAttribute("for",`tag${res.pk}`)
                    label.innerHTML = `${res.Tag}`
                    label.className = "btn btn-outline-info m-1 px-2 py-1"
                    
                    //Append to Div
                    TagListDiv.appendChild(chkbx)
                    TagListDiv.appendChild(label)
                }
            }

            toast(edit_tag,res)

        })
    }
}

const toast = (toast_for, res) => {

    switch (toast_for) {
        case "edit_tag":
            if (res.Created){

                document.getElementById("toast-body").innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"' +
                'class="bi bi-check2-circle" viewBox="0 0 16 16">' + 
                '<path d="M2.5 8a5.5 5.5 0 0 1 8.25-4.764.5.5 0 0 0 .5-.866A6.5 6.5 0 1 0 14.5 8a.5.5 0 0 0-1 0 5.5 5.5 0 1 1-11 0"/>' + 
                '<path d="M15.354 3.354a.5.5 0 0 0-.708-.708L8 9.293 5.354 6.646a.5.5 0 1 0-.708.708l3 3a.5.5 0 0 0 .708 0z"/> </svg>' +
                "&nbsp&nbsp" + res.Created
        
            } else if (res.Exists) {
        
                document.getElementById("toast-body").innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"' +
                'class="bi bi-check2-circle" viewBox="0 0 16 16">' + 
                '<path d="M2.5 8a5.5 5.5 0 0 1 8.25-4.764.5.5 0 0 0 .5-.866A6.5 6.5 0 1 0 14.5 8a.5.5 0 0 0-1 0 5.5 5.5 0 1 1-11 0"/>' + 
                '<path d="M15.354 3.354a.5.5 0 0 0-.708-.708L8 9.293 5.354 6.646a.5.5 0 1 0-.708.708l3 3a.5.5 0 0 0 .708 0z"/> </svg>' +
                "&nbsp&nbsp" + res.Exists;

                // Add yellow background for "Exists" case
                var mytoast = document.getElementById("liveToast");
                mytoast.classList.add("bg-warning", "text-dark");

                // Remove the yellow background after toast is hidden to avoid affecting future toasts
                mytoast.addEventListener('hidden.bs.toast', function handler() {
                    mytoast.classList.remove("bg-warning", "text-dark");
                    mytoast.removeEventListener('hidden.bs.toast', handler);
                });
        
            }else if (res.Deleted) {
                
                document.getElementById("toast-body").innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"' +
                'class="bi bi-check2-circle" viewBox="0 0 16 16">' + 
                '<path d="M2.5 8a5.5 5.5 0 0 1 8.25-4.764.5.5 0 0 0 .5-.866A6.5 6.5 0 1 0 14.5 8a.5.5 0 0 0-1 0 5.5 5.5 0 1 1-11 0"/>' + 
                '<path d="M15.354 3.354a.5.5 0 0 0-.708-.708L8 9.293 5.354 6.646a.5.5 0 1 0-.708.708l3 3a.5.5 0 0 0 .708 0z"/> </svg>' +
                "&nbsp&nbsp" + res.Deleted;

                // Add red background for "Deleted" case
                var mytoast = document.getElementById("liveToast");
                mytoast.classList.add("bg-danger", "text-white");

                // Remove the red background after toast is hidden to avoid affecting future toasts
                mytoast.addEventListener('hidden.bs.toast', function handler() {
                    mytoast.classList.remove("bg-danger", "text-white");
                    mytoast.removeEventListener('hidden.bs.toast', handler);
                });
        
            }else if (res.Empty){
                
                document.getElementById("toast-body").innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"' +
                'class="bi bi-exclamation-circle-fill" viewBox="0 0 16 16">' + 
                '<path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M8 4a.905.905 0 0 0-.9.995l.35 3.507a.552.552 0 0 0 1.1 0l.35-3.507A.905.905 0 0 0 8 4m.002 6a1 1 0 1 0 0 2 1 1 0 0 0 0-2"/> </svg>'+ 
                "&nbsp&nbsp" + res.Empty;

                // Add yellow background for "Empty" case
                var mytoast = document.getElementById("liveToast");
                mytoast.classList.add("bg-warning", "text-dark");

                // Remove the yellow background after toast is hidden to avoid affecting future toasts
                mytoast.addEventListener('hidden.bs.toast', function handler() {
                    mytoast.classList.remove("bg-warning", "text-dark");
                    mytoast.removeEventListener('hidden.bs.toast', handler);
                });
        
            }
         
            var mytoast = document.getElementById("liveToast")
            // Add responsive positioning classes
            mytoast.className += " position-fixed top-0 end-0 m-3 m-md-4"
            
            // Make toast width responsive
            var toast = new bootstrap.Toast(mytoast,{
                animation: true,
                autohide: true,
                delay: 3000,
                className: "toast-container w-auto min-width-300"
            })
            
            toast.show()
            
            break;
        
        // NEW CASE Start
                case "Note_Share": {
            var mytoast = document.getElementById("liveToast");
            let toastBody = document.getElementById("toast-body");
            let icon = '';
            let message = '';

            // Self_share && Not_Shared (red)
            if (res.Self_share && res.Not_Shared) {
                icon = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
                    class="bi bi-exclamation-circle-fill" viewBox="0 0 16 16">
                    <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M8 4a.905.905 0 0 0-.9.995l.35 3.507a.552.552 0 0 0 1.1 0l.35-3.507A.905.905 0 0 0 8 4m.002 6a1 1 0 1 0 0 2 1 1 0 0 0 0-2"/>
                    </svg>`;
                message = `${res.Not_Shared}<br>${res.Self_share}`;
                mytoast.classList.add("bg-danger", "text-white");
                mytoast.classList.remove("bg-warning", "text-dark");
            }
            // Self_share only (yellow)
            else if (res.Self_share && !res.Shared && !res.Not_Shared) {
                icon = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
                    class="bi bi-exclamation-triangle-fill" viewBox="0 0 16 16">
                    <path d="M8.982 1.566a1.13 1.13 0 0 0-1.964 0L.165 13.233c-.457.778.091 1.767.982 1.767h13.707c.89 0 1.438-.99.982-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1-2 0 1 1 0 0 1 2 0z"/>
                    </svg>`;
                message = `${res.Self_share}`;
                mytoast.classList.add("bg-warning", "text-dark");
                mytoast.classList.remove("bg-danger", "text-white");
            }
            // Self_share && Shared (yellow)
            else if (res.Self_share && res.Shared) {
                icon = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
                    class="bi bi-exclamation-triangle-fill" viewBox="0 0 16 16">
                    <path d="M8.982 1.566a1.13 1.13 0 0 0-1.964 0L.165 13.233c-.457.778.091 1.767.982 1.767h13.707c.89 0 1.438-.99.982-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1-2 0 1 1 0 0 1 2 0z"/>
                    </svg>`;
                message = `${res.Shared}<br>${res.Self_share}`;
                mytoast.classList.add("bg-warning", "text-dark");
                mytoast.classList.remove("bg-danger", "text-white");
            }
            // Not_Shared && Shared (yellow, no Self_share)
            else if (res.Not_Shared && res.Shared) {
                icon = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
                    class="bi bi-exclamation-triangle-fill" viewBox="0 0 16 16">
                    <path d="M8.982 1.566a1.13 1.13 0 0 0-1.964 0L.165 13.233c-.457.778.091 1.767.982 1.767h13.707c.89 0 1.438-.99.982-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1-2 0 1 1 0 0 1 2 0z"/>
                    </svg>`;
                message = `${res.Shared}<br>${res.Not_Shared}`;
                mytoast.classList.add("bg-warning", "text-dark");
                mytoast.classList.remove("bg-danger", "text-white");
            }
            // Not_Shared only (red)
            else if (res.Not_Shared) {
                icon = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
                    class="bi bi-exclamation-circle-fill" viewBox="0 0 16 16">
                    <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M8 4a.905.905 0 0 0-.9.995l.35 3.507a.552.552 0 0 0 1.1 0l.35-3.507A.905.905 0 0 0 8 4m.002 6a1 1 0 1 0 0 2 1 1 0 0 0 0-2"/>
                    </svg>`;
                message = `${res.Not_Shared}`;
                mytoast.classList.add("bg-danger", "text-white");
                mytoast.classList.remove("bg-warning", "text-dark");
            }
            // Shared only (green)
            else if (res.Shared) {
                icon = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
                    class="bi bi-check2-circle" viewBox="0 0 16 16">
                    <path d="M2.5 8a5.5 5.5 0 0 1 8.25-4.764.5.5 0 0 0 .5-.866A6.5 6.5 0 1 0 14.5 8a.5.5 0 0 0-1 0 5.5 5.5 0 1 1-11 0"/>
                    <path d="M15.354 3.354a.5.5 0 0 0-.708-.708L8 9.293 5.354 6.646a.5.5 0 1 0-.708.708l3 3a.5.5 0 0 0 .708 0z"/>
                    </svg>`;
                message = `${res.Shared}`;
                mytoast.classList.remove("bg-danger", "text-white", "bg-warning", "text-dark");
            }

            toastBody.innerHTML = icon + "&nbsp;&nbsp;" + message;

            // Show the toast
            var toast = new bootstrap.Toast(mytoast, {
                animation: true,
                autohide: true,
                delay: 4000
            });
            toast.show();

            // Remove color classes after toast is hidden
            mytoast.addEventListener('hidden.bs.toast', function handler() {
                mytoast.classList.remove("bg-danger", "text-white", "bg-warning", "text-dark");
                mytoast.removeEventListener('hidden.bs.toast', handler);
            });

            break;
        }

        default:
            break;
    }

}   

const share = (noteid) => {
    const csrftoken = Cookies.get('csrftoken')
    const email = document.getElementById("shareEmail").value
    const Note_Share = "Note_Share"
    const permission = document.getElementById("accessType").value
    fetch("/shared",{
        method : "POST",
        headers: {'X-CSRFToken': csrftoken},
        body : JSON.stringify({
            emails : email,
            note : noteid,
            permission
        })
    }).then(res => res.json())
    .then(res => {
        // Compose toast message based on response
        console.log(res)
        let messages = [];
        if (res.Shared) messages.push(res.Shared);
        if (res.Not_Shared) messages.push(res.Not_Shared);
        if (res.Self_share) messages.push(res.Self_share);

        toast(Note_Share,res);

        // If sharing was successful, update the access list
        if (res.Shared) {
            loadAccessList();
            document.getElementById("shareEmail").value = "";
            document.getElementById("accessType").selectedIndex = 0;
        }
    })
}

function loadAccessList() {
    
    const loader = document.getElementById('accessLoader');
    const container = document.getElementById('accessListContainer');
    const noteId = document.getElementById('currentNote').textContent;
    
    loader.classList.remove('d-none');
    container.classList.add('d-none');

    fetch(`/note/${noteId}/access`)
        .then(response => response.json())
        .then(data => {
            data = data.shared_with
            console.log(data)
            let html = `
                <div class="mb-4">
                    <h6 class="fw-semibold mb-3">Current Access</h6>
                    <div class="list-group shadow-sm">
            `;
            
            if (data.length > 0) {
                data.forEach(user => {
                    html += `
                        <div class="list-group-item list-group-item-action d-flex justify-content-between align-items-center">
                            <div class="d-flex align-items-center gap-2">
                                <span class="text-body">${user[0]}</span>
                                <span class="badge rounded-pill bg-secondary">${user[1]}</span>
                            </div>
                            <button class="btn btn-sm btn-outline-danger" 
                                onclick="removeAccess(${noteId}, '${user[0]}')">
                                <i class="bi bi-x-lg"></i>
                                <span class="ms-1">Remove</span>
                            </button>
                        </div>
                    `;
                });
            } else {
                html += `
                    <div class="list-group-item text-body-secondary text-center py-4">
                        <i class="bi bi-people mb-2 fs-4 d-block"></i>
                        No users have been granted access
                    </div>
                `;
            }
            
            html += `
                    </div>
                </div>
                <div>
                    <h6 class="fw-semibold mb-3">Add New Access</h6>
                    <div class="card shadow-sm">
                        <div class="card-body">
                            <div class="row g-3">
                                <div class="col-12 col-md-6">
                                    <input type="email" class="form-control" id="shareEmail" placeholder="Enter email address">
                                </div>
                                <div class="col-12 col-md-3">
                                    <select class="form-select" id="accessType">
                                        <option value="read">Read Access</option>
                                        <option value="edit">Edit Access</option>
                                    </select>
                                </div>
                                <div class="col-12 col-md-3">
                                    <button class="btn btn-primary w-100 d-flex align-items-center justify-content-center gap-2" 
                                        onclick="share(${noteId})">
                                        <i class="bi bi-plus-lg"></i>
                                        Add
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            container.innerHTML = html;
            loader.classList.add('d-none');
            container.classList.remove('d-none');
        })
        .catch(error => {
            container.innerHTML = `
                <div class="alert alert-danger d-flex align-items-center gap-2" role="alert">
                    <i class="bi bi-exclamation-triangle-fill"></i>
                    <div>Error loading access list. Please try again.</div>
                </div>
            `;
            loader.classList.add('d-none');
            container.classList.remove('d-none');
        });
}

const removeAccess = (noteId, email) => {
    const csrftoken = Cookies.get('csrftoken');
    fetch(`/note/${noteId}/access`, {
        method: 'DELETE',
        headers: {
            'X-CSRFToken': csrftoken,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: email })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            toast("Note_Share", { Shared: "Access removed successfully" });
            loadAccessList(); // Reload the access list
        } else {
            toast("Note_Share", { Not_Shared: "Failed to remove access" });
        }
    })
    .catch(error => {
        console.error('Error removing access:', error);
        toast("Note_Share", { Not_Shared: "An error occurred while removing access" });
    });
}

const loadTagsInModal = () => {
    const tagContainer = document.getElementById('tagModalTags');
    if (!tagContainer) return;
    tagContainer.innerHTML = `
        <div class="w-100 d-flex justify-content-center py-3">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
        </div>
    `;
    fetch('/tags')
        .then(response => response.json())
        .then(tags => {
            if (!tags.length) {
                tagContainer.innerHTML = `<span class="text-muted">No Tags Created</span>`;
                return;
            }
            tagContainer.innerHTML = '';
            tags.forEach(tag => {
                const input = document.createElement('input');
                input.type = 'checkbox';
                input.className = 'btn-check';
                input.value = tag.tag;
                input.name = 'Tags';
                input.id = 'AddTag' + tag.id;

                const label = document.createElement('label');
                label.className = 'btn btn-outline-success m-1';
                label.setAttribute('for', input.id);
                label.textContent = tag.tag;

                tagContainer.appendChild(input);
                tagContainer.appendChild(label);
            });
        })
        .catch(() => {
            tagContainer.innerHTML = `<span class="text-danger">Failed to load tags.</span>`;
        });
}

function deleteNote(noteId) {
    if (!confirm("Are you sure you want to  delete this note?")) return;
    const csrftoken = Cookies.get('csrftoken');
    fetch(`/note/${noteId}`, {
        method: 'DELETE',
        headers: {
            'X-CSRFToken': csrftoken,
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(res => {
        if (res.success) {
            toast("edit_tag", { Created: "Note deleted successfully." });
            setTimeout(() => {window.location.assign(BaseURL)}, 3000)
        } else {
            toast("edit_tag", { Empty: res.error || "Failed to delete note." });
        }
    })
    .catch(() => {
        toast("edit_tag", { Empty: "An error occurred while deleting the note." });
    });
}

function showNoTagsIfEmpty() {
    // Get all elements with name="tagpills"
    const tagPillsNodes = document.querySelectorAll('[name="tagpills"]');
    tagPillsNodes.forEach(node => {
        // Remove any existing "No tags" message
        const existing = node.querySelector('.no-tags-message');
        if (existing) existing.remove();

        // Check if there are any <span> children
        const hasSpan = Array.from(node.children).some(child => child.tagName === 'SPAN');
        if (!hasSpan) {
            const noTags = document.createElement('span');
            noTags.className = 'text-muted no-tags-message';
            noTags.textContent = 'No tags';
            node.appendChild(noTags);
        }
    });
}