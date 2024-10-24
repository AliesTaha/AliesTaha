
    def __init__(self):
        self.name = "Ali Taha"
        self.education = "UWaterloo Computer Engineering"
        self.location = "Canada"
        self.role = {
            "current": "SWE @ Tesla",
            "previous": "SWE @ Ford/Blackberry"}

    def moreInfo(self):
        aboutMe = {
            "currentFocus" : ["Learn Firmware"],
            "languages" : ["Python", "C++", "C"]
        }
        print(aboutMe)

    def say_hi(self):
        print("Contact me through my personal website or email for any inquiries or requests")
