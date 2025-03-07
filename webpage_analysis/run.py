import sys
import requests
from selenium import webdriver

def read_webpage(url):
    response = requests.get(url)
    if response.status_code == 200:
        return response.text

def render_and_screenshot(url):
    driver = webdriver.PhantomJS()
    driver.get(url)
    driver.save_screenshot('webpage_screenshot.png')
    driver.quit()
    print("Screenshot saved successfully.")

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python run.py <URL>")
        sys.exit(1)

    url = sys.argv[1]
    text = read_webpage(url)
    render_and_screenshot(url)
    