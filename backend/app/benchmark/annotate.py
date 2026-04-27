import csv

def write_unattributed_quotes_to_csv(quotes, filename):
    with open(filename, mode='w', newline='', encoding='utf-8') as csvfile:
        fieldnames = ['gold_speaker', 'quote_id', 'quote_text', 'chapter_number', 'prior', 'post']
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)

        writer.writeheader()
        for idx, quote in enumerate(quotes):
            writer.writerow({
                'gold_speaker': '', 
                'quote_id': f"ch{quote['chapter_number']}_q{idx:03d}",
                'quote_text': quote.get('quote', ''),
                'chapter_number': quote.get('chapter_number', ''),
                'prior': quote.get('prior', ''),
                'post': quote.get('post', '')
            })
