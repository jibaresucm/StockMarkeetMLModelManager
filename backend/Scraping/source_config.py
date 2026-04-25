TECH_SOURCES = [

    {
        "name": "techcrunch",
        "type": "latest",
        "base_url": "https://techcrunch.com/latest/",

        "selectors": {
            "article": ("li", "wp-block-post"),
            "title_container": ("h3", "loop-card__title"),
            "title_link": "a",
            "time": "time",
            "time_attr": "datetime"
        }
            
    }
    

]