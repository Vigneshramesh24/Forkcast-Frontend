import re
import json
from datetime import datetime
from langchain_community.document_loaders import PyPDFLoader


class RestaurantAnalyticsExtractor:
    """
    Extracts restaurant analytics from PDF documents.
    Only extracts data that is actually present in the PDF (no hallucination).
    """

    def __init__(self):
        self.text = ""
        self.lines = []

    def extract_from_pdf(self, pdf_path):
        """
        Main entry point: Extract all analytics from a PDF file.
        Returns a properly formatted JSON report.
        """
        try:
            loader = PyPDFLoader(pdf_path)
            docs = loader.load()
            self.text = "\n\n".join([d.page_content for d in docs])
            self.lines = self.text.split('\n')
        except Exception as e:
            print(f"Error loading PDF {pdf_path}: {e}")
            return self._empty_report()

        report = {
            "restaurant_report": {
                "metadata": self._extract_metadata(),
                "top_selling_item": self._extract_top_selling_item(),
                "top_5_selling_items": self._extract_top_5_selling_items(),
                "bottom_5_selling_items": self._extract_bottom_5_selling_items(),
                "menu_items": self._extract_menu_items(),
                "daily_sales_summary": self._extract_daily_sales_summary(),
                "total_month_sales": self._extract_total_month_sales(),
                "expenses_over_time": self._extract_expenses_over_time(),
                "revenue_over_time": self._extract_revenue_over_time(),
                "profit_over_time": self._extract_profit_over_time(),
                "sales_percentages_by_item": self._extract_sales_percentages_by_item(),
                "tips": self._extract_tips()
            }
        }

        return report

    def _empty_report(self):
        """Return an empty report template."""
        return {
            "restaurant_report": {
                "metadata": {
                    "month": "",
                    "restaurant_name": ""
                },
                "top_selling_item": {
                    "item_name": "",
                    "units_sold": 0,
                    "percentage_of_sales": 0.0
                },
                "top_5_selling_items": [],
                "bottom_5_selling_items": [],
                "menu_items": [],
                "daily_sales_summary": [],
                "total_month_sales": {
                    "number_of_sales": 0,
                    "units_sold": 0,
                    "total_sales_amount": 0.0
                },
                "expenses_over_time": [],
                "revenue_over_time": [],
                "profit_over_time": [],
                "sales_percentages_by_item": [],
                "tips": []
            }
        }

    def _extract_metadata(self):
        """Extract month and restaurant name."""
        metadata = {
            "month": "",
            "restaurant_name": ""
        }

        # Try to find month in various formats
        month_patterns = [
            r'(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{4})',
            r'(\d{4})-(\d{2})',  # YYYY-MM format
            r'(?:Month|Period):\s*([A-Za-z]+\s+\d{4})',
        ]

        for pattern in month_patterns:
            match = re.search(pattern, self.text, re.IGNORECASE)
            if match:
                if pattern == r'(\d{4})-(\d{2})':
                    metadata["month"] = f"{match.group(1)}-{match.group(2)}"
                else:
                    month_str = match.group(0) if match.lastindex else match.group(1)
                    # Try to parse the month string to YYYY-MM format
                    try:
                        dt = datetime.strptime(month_str, "%B %Y")
                        metadata["month"] = dt.strftime("%Y-%m")
                    except:
                        metadata["month"] = month_str
                break

        # Try to find restaurant name
        name_patterns = [
            r'(?:Restaurant|Restaurant Name|Establishment):\s*([^\n]+)',
            r'^([A-Za-z\s&\-\']{3,100})(?:\n|$)',  # First line as restaurant name
        ]

        for pattern in name_patterns:
            match = re.search(pattern, self.text, re.IGNORECASE | re.MULTILINE)
            if match:
                name = match.group(1).strip()
                if len(name) > 3 and len(name) < 150:
                    metadata["restaurant_name"] = name
                    break

        return metadata

    def _extract_top_selling_item(self):
        """Extract the single top selling item."""
        top_5 = self._extract_top_5_selling_items()
        if top_5:
            return top_5[0]
        return {
            "item_name": "",
            "units_sold": 0,
            "percentage_of_sales": 0.0
        }

    def _extract_top_5_selling_items(self):
        """Extract top 5 selling items."""
        items = []

        # Look for "Top Selling Items" or "Best Sellers" sections
        patterns = [
            r'(?:Top\s+(?:5\s+)?Selling|Best\s+Sellers?)[\s\S]{0,50}?\n([\s\S]{0,500}?)(?:\n\n|Bottom|Total)',
        ]

        for pattern in patterns:
            match = re.search(pattern, self.text, re.IGNORECASE)
            if match:
                section = match.group(1)
                # Look for item lines with format: Item Name - Units - %
                item_pattern = r'([A-Za-z\s\-\&\'\.]+?)\s*[-–]\s*(\d+)\s+(?:units?|sold)?\s*[-–]?\s*(\d+\.?\d*)%?'
                for item_match in re.finditer(item_pattern, section):
                    if len(items) < 5:
                        items.append({
                            "item_name": item_match.group(1).strip(),
                            "units_sold": int(item_match.group(2)),
                            "percentage_of_sales": float(item_match.group(3)) if item_match.group(3) else 0.0
                        })
                break

        return items

    def _extract_bottom_5_selling_items(self):
        """Extract bottom 5 selling items."""
        items = []

        # Look for "Bottom Selling Items" or "Least Popular" sections
        patterns = [
            r'(?:Bottom\s+(?:5\s+)?Selling|Least\s+Popular)[\s\S]{0,50}?\n([\s\S]{0,500}?)(?:\n\n|Menu|Total)',
        ]

        for pattern in patterns:
            match = re.search(pattern, self.text, re.IGNORECASE)
            if match:
                section = match.group(1)
                # Look for item lines with format: Item Name - Units - %
                item_pattern = r'([A-Za-z\s\-\&\'\.]+?)\s*[-–]\s*(\d+)\s+(?:units?|sold)?\s*[-–]?\s*(\d+\.?\d*)%?'
                for item_match in re.finditer(item_pattern, section):
                    if len(items) < 5:
                        items.append({
                            "item_name": item_match.group(1).strip(),
                            "units_sold": int(item_match.group(2)),
                            "percentage_of_sales": float(item_match.group(3)) if item_match.group(3) else 0.0
                        })
                break

        return items

    def _extract_menu_items(self):
        """Extract menu items with category and price."""
        items = []

        # Look for "Menu" or "Menu Items" section
        pattern = r'(?:Menu|Menu Items)[\s\S]{0,50}?\n([\s\S]{0,1000}?)(?:\n\n|Daily|Sales|Total)'
        match = re.search(pattern, self.text, re.IGNORECASE)

        if match:
            section = match.group(1)
            # Look for items with format: Category - Item Name - $Price
            item_pattern = r'([A-Za-z\s]+?)\s*[-–]\s*([A-Za-z\s\-\&\'\.]+?)\s*[-–]\s*\$?([\d,]+\.?\d*)'
            for item_match in re.finditer(item_pattern, section):
                items.append({
                    "item_name": item_match.group(2).strip(),
                    "category": item_match.group(1).strip(),
                    "price": float(item_match.group(3).replace(',', ''))
                })

        return items

    def _extract_daily_sales_summary(self):
        """Extract daily sales summary."""
        daily_sales = []

        # Look for daily sales table or section
        pattern = r'(?:Daily|Day)\s+(?:Sales|Summary)[\s\S]{0,50}?\n([\s\S]{0,2000}?)(?:\n\n|Total|Monthly)'
        match = re.search(pattern, self.text, re.IGNORECASE)

        if match:
            section = match.group(1)
            # Look for lines with date and sales data
            day_pattern = r'(\d{1,2}[-/]\d{1,2}[-/]\d{2,4}|\d{4}-\d{2}-\d{2})\s+([A-Za-z]+)?\s+Week\s*:?\s*(\d+)?\s+Sales?\s*:?\s*(\d+)\s+Units?\s*:?\s*(\d+)\s+Amount?\s*:?\s*\$?([\d,]+\.?\d*)'
            
            for day_match in re.finditer(day_pattern, section):
                date_str = day_match.group(1)
                day_of_week = day_match.group(2) or ""
                week_num = int(day_match.group(3)) if day_match.group(3) else 0
                num_sales = int(day_match.group(4))
                units_sold = int(day_match.group(5))
                total_amount = float(day_match.group(6).replace(',', ''))

                daily_sales.append({
                    "date": date_str,
                    "day_of_week": day_of_week.strip(),
                    "week_number": week_num,
                    "number_of_sales": num_sales,
                    "units_sold": units_sold,
                    "total_sales_amount": total_amount
                })

        return daily_sales

    def _extract_total_month_sales(self):
        """Extract total monthly sales."""
        totals = {
            "number_of_sales": 0,
            "units_sold": 0,
            "total_sales_amount": 0.0
        }

        # Look for total/summary section
        patterns = [
            r'(?:Total|Monthly|Overall)\s+(?:Sales|Summary)[\s\S]{0,200}?(?:Sales|Transactions)\s*:?\s*(\d+)[\s\S]{0,50}?Units?\s*:?\s*(\d+)[\s\S]{0,50}?Amount?\s*:?\s*\$?([\d,]+\.?\d*)',
            r'(?:Total|Grand\s+Total)\s*[\s\S]{0,100}?(\d+)\s+(?:sales|transactions)[\s\S]{0,50}?(\d+)\s+units?[\s\S]{0,50}?\$?([\d,]+\.?\d*)',
        ]

        for pattern in patterns:
            match = re.search(pattern, self.text, re.IGNORECASE)
            if match:
                totals["number_of_sales"] = int(match.group(1))
                totals["units_sold"] = int(match.group(2))
                totals["total_sales_amount"] = float(match.group(3).replace(',', ''))
                break

        return totals

    def _extract_expenses_over_time(self):
        """Extract expenses over time."""
        expenses = []

        # Look for "Expenses" or "Costs" section
        pattern = r'(?:Expenses|Costs)[\s\S]{0,50}?\n([\s\S]{0,2000}?)(?:\n\n|Revenue|Profit|Total)'
        match = re.search(pattern, self.text, re.IGNORECASE)

        if match:
            section = match.group(1)
            # Look for date and expense entries
            expense_pattern = r'(\d{1,2}[-/]\d{1,2}[-/]\d{2,4}|\d{4}-\d{2}-\d{2})\s+([A-Za-z\s\-\&]+?)\s+\$?([\d,]+\.?\d*)'
            
            for exp_match in re.finditer(expense_pattern, section):
                expenses.append({
                    "date": exp_match.group(1),
                    "expense_category": exp_match.group(2).strip(),
                    "amount": float(exp_match.group(3).replace(',', ''))
                })

        return expenses

    def _extract_revenue_over_time(self):
        """Extract revenue over time."""
        revenue = []

        # Look for "Revenue" section
        pattern = r'(?:Revenue)[\s\S]{0,50}?\n([\s\S]{0,2000}?)(?:\n\n|Profit|Expenses|Total)'
        match = re.search(pattern, self.text, re.IGNORECASE)

        if match:
            section = match.group(1)
            # Look for date and revenue entries
            revenue_pattern = r'(\d{1,2}[-/]\d{1,2}[-/]\d{2,4}|\d{4}-\d{2}-\d{2})\s+\$?([\d,]+\.?\d*)'
            
            for rev_match in re.finditer(revenue_pattern, section):
                revenue.append({
                    "date": rev_match.group(1),
                    "revenue": float(rev_match.group(2).replace(',', ''))
                })

        return revenue

    def _extract_profit_over_time(self):
        """Extract profit over time."""
        profit = []

        # Look for "Profit" section
        pattern = r'(?:Profit)[\s\S]{0,50}?\n([\s\S]{0,2000}?)(?:\n\n|Tips|Total|Analysis)'
        match = re.search(pattern, self.text, re.IGNORECASE)

        if match:
            section = match.group(1)
            # Look for date and profit entries
            profit_pattern = r'(\d{1,2}[-/]\d{1,2}[-/]\d{2,4}|\d{4}-\d{2}-\d{2})\s+\$?([\d,]+\.?\d*)'
            
            for profit_match in re.finditer(profit_pattern, section):
                profit.append({
                    "date": profit_match.group(1),
                    "profit": float(profit_match.group(2).replace(',', ''))
                })

        return profit

    def _extract_sales_percentages_by_item(self):
        """Extract sales percentages by item."""
        percentages = []

        # Look for "Sales by Item" or similar section
        pattern = r'(?:Sales|Revenue)\s+(?:by\s+Item|Percentage|Breakdown)[\s\S]{0,50}?\n([\s\S]{0,2000}?)(?:\n\n|Tips|Total|Analysis)'
        match = re.search(pattern, self.text, re.IGNORECASE)

        if match:
            section = match.group(1)
            # Look for item and percentage entries
            item_pattern = r'([A-Za-z\s\-\&\'\.]+?)\s+(\d+\.?\d*)%'
            
            for item_match in re.finditer(item_pattern, section):
                percentages.append({
                    "item_name": item_match.group(1).strip(),
                    "percentage_of_total_sales": float(item_match.group(2))
                })

        return percentages

    def _extract_tips(self):
        """Extract tips and recommendations."""
        tips = []

        # Look for "Tips", "Recommendations", or "Insights" section
        pattern = r'(?:Tips|Recommendations|Insights|Analysis)[\s\S]{0,50}?\n([\s\S]{0,2000}?)(?:$|EOF)'
        match = re.search(pattern, self.text, re.IGNORECASE)

        if match:
            section = match.group(1)
            # Look for numbered or bulleted tips
            tip_pattern = r'(?:\d+\.|[-•*])\s+([^:\n]+):\s*([^\n]+)'
            
            for tip_match in re.finditer(tip_pattern, section):
                tips.append({
                    "tip_title": tip_match.group(1).strip(),
                    "tip_description": tip_match.group(2).strip()
                })

        return tips


def extract_restaurant_analytics(pdf_path):
    """
    Convenience function to extract analytics from a PDF.
    Returns the complete analytics report as a dictionary.
    """
    extractor = RestaurantAnalyticsExtractor()
    return extractor.extract_from_pdf(pdf_path)
