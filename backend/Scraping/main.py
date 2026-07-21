import threading

from run_scraper import run_scraper
from monitor_latest import monitor_latest


def main():

    scraper_thread = threading.Thread(
        target=run_scraper,
        name="HistoricalScraper"
    )

    monitor_thread = threading.Thread(
        target=monitor_latest,
        name="LatestMonitor"
    )

    scraper_thread.start()
    monitor_thread.start()

    scraper_thread.join()
    monitor_thread.join()


if __name__ == "__main__":
    main()