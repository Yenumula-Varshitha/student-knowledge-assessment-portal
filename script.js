function setCookie(name, value)
{
    document.cookie = name + "=" + value + ";path=/";
}

function getCookie(name)
{
    var cookies = document.cookie.split(";");
    for (var i = 0; i < cookies.length; i++)
    {
        var c = cookies[i].trim();
        if (c.indexOf(name + "=") == 0)
        {
            return c.substring(name.length + 1);
        }
    }
    return "";
}
function signup()
{
    var u = document.getElementById("newuser").value.trim();
    var p = document.getElementById("newpass").value.trim();

    if (u == "" || p == "")
    {
        showMsg("msg", "Please fill in all fields.", "error");
        return;
    }

    var x = new XMLHttpRequest();
    x.onreadystatechange = function()
    {
        if (this.readyState == 4 && this.status == 200)
        {
            var res = this.responseText.trim();
            if (res == "signup_success")
            {
                showMsg("msg", "Signup successful! Redirecting to login...", "success");
                setTimeout(function() { window.location = "login.html"; }, 1500);
            }
            else if (res == "user_exists")
            {
                showMsg("msg", "Username already exists. Try another.", "error");
            }
            else
            {
                showMsg("msg", "Error: " + res, "error");
            }
        }
    };
    x.open("GET", "process.php?action=signup&user=" + encodeURIComponent(u) + "&pass=" + encodeURIComponent(p), true);
    x.send();
}
function loginUser()
{
    var u = document.getElementById("username").value.trim();
    var p = document.getElementById("password").value.trim();

    if (u == "" || p == "")
    {
        showMsg("msg", "Please enter username and password.", "error");
        return;
    }

    var x = new XMLHttpRequest();
    x.onreadystatechange = function()
    {
        if (this.readyState == 4 && this.status == 200)
        {
            var res = this.responseText.trim();
            if (res == "success")
            {
                setCookie("username", u);
                window.location = "instructions.html";
            }
            else
            {
                showMsg("msg", "Invalid Username or Password.", "error");
            }
        }
    };
    x.open("GET", "process.php?action=login&user=" + encodeURIComponent(u) + "&pass=" + encodeURIComponent(p), true);
    x.send();
}
function loadQuiz()
{
    var params = new URLSearchParams(window.location.search);
    var topic = params.get("topic");

    if (!topic)
    {
        document.getElementById("quizBox").innerHTML = "No topic selected.";
        return;
    }

    
    var topicMap = {
        "html"  : "questions_web.xml",
        "xml"   : "questions_xml.xml",
        "php"   : "questions_php.xml",
        "dbms"  : "questions_dbms.xml"
    };

    var file = topicMap[topic.toLowerCase()];

    if (!file)
    {
        document.getElementById("quizBox").innerHTML = "Invalid topic selected.";
        return;
    }

    
    document.getElementById("quizTitle").innerHTML = topic.toUpperCase() + " Quiz";

    
    var x = new XMLHttpRequest();
    x.onreadystatechange = function()
    {
        if (this.readyState == 4 && this.status == 200)
        {
            // Parse XML response - Lab XML Pattern
            var parser = new DOMParser();
            var xml = parser.parseFromString(this.responseText, "text/xml");

            // Check for XML parse errors
            if (xml.getElementsByTagName("parsererror").length > 0)
            {
                document.getElementById("quizBox").innerHTML = "XML FORMAT ERROR.";
                return;
            }

            var questions = xml.getElementsByTagName("question");

            if (questions.length === 0)
            {
                document.getElementById("quizBox").innerHTML = "No questions found.";
                return;
            }

            var output = "";

            
            for (var i = 0; i < questions.length; i++)
            {
                var textNode = questions[i].getElementsByTagName("text")[0];
                if (!textNode) continue;

                
                var qText = textNode.innerHTML;

                output += "<p><b>" + (i + 1) + ". " + qText + "</b></p>";

                var options = questions[i].getElementsByTagName("option");

                
                for (var j = 0; j < options.length; j++)
                {
                    var val = options[j].getAttribute("correct") === "true" ? 1 : 0;

                   
                    output += "<input type='radio' name='q" + i + "' value='" + val + "'> ";
                    output += options[j].innerHTML + "<br>";
                }

                output += "<br>";
            }

            document.getElementById("quizBox").innerHTML = output;
        }
        else if (this.readyState == 4)
        {
            document.getElementById("quizBox").innerHTML = "Error loading questions. Check XML file name.";
        }
    };
    x.open("GET", file, true);
    x.send();
}
function calculateScore()
{
    var totalQuestions = document.querySelectorAll("#quizBox p").length;
    var score = 0;

    // Loop through all questions - Lab for loop pattern
    for (var i = 0; i < totalQuestions; i++)
    {
        var selected = document.querySelector("input[name='q" + i + "']:checked");
        if (selected && selected.value == "1")
        {
            score = score + 1;
        }
    }

    setCookie("score", score);
    window.location = "result.html";
}
function saveToDB()
{
    var user  = getCookie("username");
    var score = getCookie("score");

    if (user == "" || score == "")
    {
        alert("Please take the quiz first.");
        return;
    }

    var x = new XMLHttpRequest();
    x.onreadystatechange = function()
    {
        if (this.readyState == 4 && this.status == 200)
        {
            if (this.responseText.trim() == "saved")
            {
                alert("Score saved successfully!");
                window.location = "leaderboard.html";
            }
            else
            {
                alert("Error: " + this.responseText);
            }
        }
    };
    x.open("GET", "process.php?action=save&user=" + encodeURIComponent(user) + "&score=" + encodeURIComponent(score), true);
    x.send();
}
function loadLeaderboard()
{
    var el = document.getElementById("leaderboard");
    if (el)
    {
        el.innerHTML = "<tr><td colspan='3'>Loading...</td></tr>";
    }

    var x = new XMLHttpRequest();
    x.onreadystatechange = function()
    {
        if (this.readyState == 4)
        {
            if (this.status == 200 && this.responseText.trim() !== "")
            {
                el.innerHTML = this.responseText;
            }
            else if (this.status == 200)
            {
                el.innerHTML = "<tr><td colspan='3' style='color:#888;'>No scores saved yet. Be the first!</td></tr>";
            }
            else
            {
                el.innerHTML = "<tr><td colspan='3' style='color:red;'>Failed to load leaderboard.</td></tr>";
            }
        }
    };
    x.open("GET", "process.php?action=leaderboard", true);
    x.send();
}
function showMsg(id, text, type)
{
    var el = document.getElementById(id);
    if (el)
    {
        el.innerHTML = text;
        el.className = (type == "success") ? "msg-success" : "msg-error";
    }
}
