
    def __init__(self):
        self.name = "ali taha"
        self.education = "uwaterloo computer engineering"
        self.location = "california"
        self.role = {
            "curr": "ai/swe @ tesla",
            "prev": "swer @ ford/blackberry"}

    def moreInfo(self):
        aboutMe = {
            "currentFocus" : ["implement ml papers"],
            "languages" : ["python", "c++", "c"]
        }
        print(aboutMe)

    def say_hi(self):
        print("contact ali.taha@uwaterloo.ca")
