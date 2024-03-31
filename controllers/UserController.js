                            class UserController{

                                constructor(formIdCreate,formIdUpdate,tableId){

                                    this.formId = document.getElementById(formIdCreate);
                                    this.formIdUp= document.getElementById(formIdUpdate);
                                    this.tableId = document.getElementById(tableId);

                                    this.onSubmit();
                                    this.onEditCancel();
                                }

                                onEditCancel(){
                                    document.querySelector("#box-user-update .btn-cancel").addEventListener("click",
                                    e=>{
                                        this.showPanelCreate();
                                    });

                                    this.formIdUp.addEventListener("submit", event =>{

                                        event.preventDefault();

                                        let btn = this.formIdUp.querySelector("[type=submit]");

                                        btn.disabled = true;

                                        let values = this.getValues(this.formIdUp);
                                        if(!values) return false;
                                        let index = this.formIdUp.dataset.trIndex;

                                        let tr = this.tableId.rows[index];

                                        let userOld = JSON.parse(tr.dataset.user);

                                        let result = Object.assign({},userOld, values);
                                                                  

                                    ;

                                    this.getPhoto(this.formIdUp).then(
                                        (content)=>{
                                            if(!values.photo) 
                                            {
                                                result._photo = userOld._photo;
                                            }
                                            else{
                                                result._photo = content;
                                            }
                                            
                                            tr.dataset.user = JSON.stringify(result);
                                            tr.innerHTML = `
                                            <td><img src="${result._photo}" alt="User Image" class="img-circle img-sm"></td>
                                            <td>${result._name}</td>
                                            <td>${result._email}</td>
                                            <td>${(result._admin) ? 'Sim' : 'Não'}</td>
                                            <td>${Utils.dateFormat(result._register)}</td>
                                            <td>
                                            <button type="button" class="btn btn-primary btn-edit btn-xs btn-flat">Editar</button>
                                            <button type="button" class="btn btn-danger btn-xs btn-flat">Excluir</button>
                                            </td>
                                        `;
                                        this.addEventsTR(tr);

                                        this.updateCount();

                                        
                                        btn.disabled = false;

                                        this.formIdUp.reset();

                                        this.showPanelCreate();


                                        },
                                        (e)=>{
                                        console.error(e);
                                        }
                                    );

                                    
                                    });

                                }

                                onSubmit(){
                                    
                                    this.formId.addEventListener("submit",event => {

                                        event.preventDefault();

                                        let btnSalvar = this.formId.querySelector("[type=submit]");
                                        btnSalvar.disabled = true;

                                        let values = this.getValues(this.formId);
                                        if(!values) return false;
                                        this.getPhoto(this.formId).then(
                                            (content)=>{
                                            values.photo = content;
                                            this.addLine(values);
                                            this.formId.reset();
                                            btnSalvar.disabled = false;
                                            },
                                            (e)=>{
                                            console.error(e);
                                            }
                                        );
                                    });

                                }

                                getPhoto(formId){

                                    return new Promise((resolve, reject)=>{

                                        let fileReader = new FileReader();

                                        let elements =  [...formId.elements].filter(item=>{

                                        if(item.name === 'photo')
                                        {
                                            return item
                                        };

                                        });

                                        let file = elements[0].files[0];

                                        fileReader.onload = () =>{  
                                        resolve(fileReader.result);
                                        };

                                        fileReader.onerror = (e) =>{
                                            reject(e);
                                        }

                                        if(file)
                                        {
                                            fileReader.readAsDataURL(file);
                                        }else{
                                            return resolve();
                                        }

                                    });

                                

                                }

                                getValues(formId){

                                let user = {};
                                let isValid = true; 

                                    [...formId.elements].forEach(function(field,index){

                                        if(['name','email','password'].indexOf(field.name) > -1 && !field.value){

                                            field.parentElement.classList.add('has-error');
                                            isValid = false;

                                        }

                                        if(field.name == "gender"){
                                            if(field.checked){
                                                user[field.name] = field.value;
                                            }
                                        }
                                        else if(field.name === 'admin')
                                        {
                                            user[field.name] = field.checked;
                                        }
                                        else{
                                            user[field.name] = field.value;
                                        }
                                    });
                                
                                    if(!isValid){
                                        return false;
                                    }

                                    return new User(
                                        user.name, 
                                        user.gender,
                                        user.birth,
                                        user.country,
                                        user.email,
                                        user.password,
                                        user.photo,
                                        user.admin
                                    );

                                }

                                addLine(dataUser){

                                

                                    let tr = document.createElement('tr');

                                    tr.dataset.user = JSON.stringify(dataUser);

                                    tr.innerHTML = ` 
                                
                                        <td><img src="${dataUser.photo}" alt="User Image" class="img-circle img-sm"></td>
                                        <td>${dataUser.name}</td>
                                        <td>${dataUser.email}</td>
                                        <td>${(dataUser.admin) ? 'Sim' : 'Não'}</td>
                                        <td>${Utils.dateFormat(dataUser.register)}</td>
                                        <td>
                                        <button type="button" class="btn btn-primary btn-edit btn-xs btn-flat">Editar</button>
                                        <button type="button" class="btn btn-danger btn-delete btn-xs btn-flat">Excluir</button>
                                        </td>
                                    `;

                                this.addEventsTR(tr);

                                    this.tableId.appendChild(tr);

                                    this.updateCount();
                                }

                                addEventsTR(tr){


                                    tr.querySelector(".btn-delete").addEventListener("click", e =>{

                                        if(confirm("Deseja relamente excluir esse registro?")){
                                            tr.remove();
                                            this.updateCount();
                                        }

                                    });

                                    tr.querySelector(".btn-edit").addEventListener("click",
                                    e=>{

                                        let json = JSON.parse(tr.dataset.user);
                                    

                                        this.formIdUp.dataset.trIndex = tr.sectionRowIndex;

                                        for(let name in json){

                                            let field = this.formIdUp.querySelector("[name=" + name.replace("_","") + "]");
                                            
                                            

                                            if(field){

                                                switch(field.type)
                                                {
                                                    case 'file':
                                                    continue;
                                                    break

                                                    case 'radio':
                                                        field = this.formIdUp.querySelector("[name=" + name.replace("_","") + "][value=" + json[name] + "]");
                                                        field.checked = true;
                                                    break

                                                    case 'checkbox':
                                                        
                                                        field.checked = json[name];
                                                    break

                                                    default:
                                                        field.value = json[name]; 
                                                }


                                            }
                                        }

                                        this.formIdUp.querySelector(".photo").src = json._photo;

                                    this.showPanelUpdate();
                                    });
                                };

                                updateCount(){
                                    let numberUser = 0;
                                    let numberAdmin = 0;
                                    [...this.tableId.children].forEach(tr=>
                                        {
                                            numberUser++;

                                            let user = JSON.parse(tr.dataset.user);

                                            if(user._admin) numberAdmin++;

                                    });
                                        document.querySelector("#number-users").innerHTML = numberUser;
                                        document.querySelector("#number-users-admin").innerHTML = numberAdmin;
                                }

                                showPanelCreate(){
                                    document.querySelector("#box-user-create").style.display = "block";
                                    document.querySelector("#box-user-update").style.display = "none";
                                }

                                showPanelUpdate(){
                                    document.querySelector("#box-user-create").style.display = "none";
                                    document.querySelector("#box-user-update").style.display = "block";
                                }
                            }   