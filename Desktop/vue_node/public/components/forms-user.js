//Template for the LOGINF FORM, it includes some models like currentEmail and currentPassword and event checkLogin at click
let usersComponent = Vue.component('form-login', {
    template: `
<div>
    <img src="img/avatar.jpg" height="300">
    <h1>Login</h1>
    <form onsubmit="event.preventDefault();">
        <div class="field">
            <label for="emailLogin">Email:</label>
            <input type="email" id="emailLogin" name="user_email" placeholder="youremail@domain.com" required="" v-model="currentEmail">
        </div>
        <div class="field">
            <label for="passwordLogin">Password:</label>
            <input type="password" id="passwordLogin" name="user_password" placeholder="your password" required="" v-model="currentPassword">
        </div>
        <div class="button">
            <button @click="checkLogin" type="submit">Login</button>
        </div>
    </form>
    <p id="create_account"><a href="#" @click="goToRegister">Create Account</a></p>
</div>`,
    data() {
        return {
            currentEmail: "",        //model to field email
            currentPassword: "",     //model to field password
        }
    },
    methods: {
        checkLogin: function () {   //find the user with email and password in the array of users, if it finds it, it logged in
            fetch('/api/users/login', {
                method: 'POST',
                body: JSON.stringify({
                    email: this.currentEmail,
                    password: this.currentPassword
                }),
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            .then(data => data.json())
            .then(user => {
                if (!user) {
                    return  alert("incorrect username/password");
                }
                if (user.role === 'student' || user.role === 'parent') {
                    vm.setCurrentPage("dashboardUser"); //it shows the user dashboard if it is student or parent
                } else if (user.role === 'provider') {
                    vm.setCurrentPage("dashboardProvider");  //it shows the provider dashboard if it is provider
                }
                vm.currentUserEmail = user.email;    //it gets the email
                vm.currentRole = user.role;        //it gets the role
                vm.currentAboutMe = user.aboutMe;  //it gets the about me
                vm.userId = user._id;
                localStorage.setItem('loggedInUser', JSON.stringify(user));
                localStorage.setItem('aboutMe',user.aboutMe);
            }).catch((err) => {
                console.log(err);
            })
        },
        goToRegister: function () {
            event.preventDefault();
            vm.setCurrentPage("register");
        }
    }
});

//Component form-register with template and method addUser
let addUser = Vue.component('form-register', {
    template: `
<div>
    <img src="img/avatar.jpg" height="300">
    <h1>Register</h1>
    <form onsubmit="event.preventDefault();">
        <div class="field">
            <label for="email">Email:</label>
            <input type="email" id="email" name="user_email" placeholder="youremail@domain.com" required="" v-model="currentEmail">
        </div>
        <div class="field">
            <label for="password">Password:</label>
            <input type="password" id="password" name="user_password" placeholder="your password" required="" v-model="currentPassword">
        </div>
        <div class="field">
            <label for="role">Role:</label>
            <select name="role" v-model="currentRole" >
                <option>student</option>
                <option>parent</option>
                <option value="provider">Service Provider</option>
            </select>
        </div>
        <div class="button">
            <button @click="addUser" type="submit">Register</button>
        </div>
    </form>
    <p id="create_account"><a href="#" @click="login">login</a></p>
</div>`,
    data() {
        return {
            currentEmail: "",        //for connecting to the field of email
            currentPassword: "",     //model for password field
            currentRole: "Student",  //current role student by default
        }
    },
    methods: {
        addUser: function () {      //addUser function, it will add a user if validemail and password different than empty
            if (this.validEmail(this.currentEmail) && this.currentPassword != '') {
                fetch('/api/users/', {
                    method: 'POST',
                    body: JSON.stringify({
                        email: this.currentEmail,
                        password: this.currentPassword,
                        role:this.currentRole
                    }),
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }).then(data => data.json()).then(user => {
                    console.log(user);
                    vm.setCurrentPage("login");
                }).catch((err) => {
                    console.log(err);
                    alert("incorrect username/password");
                });
            } else {
                alert("Valid email and password are required to add a user");
            }

        },
        login: function () {
            vm.setCurrentPage("login");
        },
        validEmail: function (email) {  //to validate email format by regex expression
            var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            return re.test(email);
        }
    }

});



//component to edit bios from user with template and method editUser
//dashboard function is just to redirect after edit
let editUser = Vue.component('form-profile', {
    template: `
<div>
    <div class="field">
        <label for="role">Bio:</label><br>
        <textarea rows="7" name="aboutMe" id="aboutMe" v-model="bio"></textarea>
    </div>
    <div class="button">
        <button @click="updateUser">Update</button>
    </div>
    <a href="#" @click="dashboard">Dashboard</a>
</div>`,
    data() {
        return {
            bio:this.getBio() //,
        }
    },
    methods: {
        getBio: function(){
            if(this.bio) {
                return this.bio;
            }
            return localStorage.getItem('aboutMe');
        },
        dashboard: function () {
            if (vm.getCurrentRole() == 'provider') {
                vm.setCurrentPage("dashboardProvider");
            } else {
                vm.setCurrentPage("dashboardUser");
            }
        },
        updateUser: function () {
            fetch('/api/users/'+JSON.parse(localStorage.getItem('loggedInUser'))._id, {
                method: 'PUT',
                body: JSON.stringify({
                    aboutMe: this.bio
                }),
                headers: {
                    'Content-Type': 'application/json'
                }
            }).then(data => data.json()).then(user => {
                if (user.role === 'student' || user.role === 'parent') {
                    vm.setCurrentPage("dashboardUser"); //it shows the user dashboard if it is student or parent
                } else if (user.role === 'provider') {
                    vm.setCurrentPage("dashboardProvider");  //it shows the provider dashboard if it is provider
                }
                localStorage.setItem('aboutMe',this.bio);
            }).catch((err) => {
                alert(err);
            });

            this.dashboard();
        }
    }

});