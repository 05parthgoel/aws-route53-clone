import re
from typing import List, Dict, Any

def parse_bind_zone(zone_content: str, zone_name: str) -> List[Dict[str, Any]]:
    """
    Parses a BIND zone file string and returns a list of record dicts.
    """
    lines = zone_content.splitlines()
    default_ttl = 300
    origin = zone_name.rstrip('.') + '.'
    records = []
    
    # Regex pattern for basic BIND record matching
    # e.g., @ IN A 192.0.2.1
    # e.g., www 3600 IN CNAME example.com.
    # e.g., @ IN MX 10 mail.example.com.
    
    current_ttl = default_ttl

    for line in lines:
        line = line.strip()
        # Remove comments
        if not line or line.startswith(';') or line.startswith('#'):
            continue
        
        # Handle directives
        if line.isupper() and line.startswith('$ORIGIN'):
            parts = line.split()
            if len(parts) > 1:
                origin = parts[1].rstrip('.') + '.'
            continue
        if line.isupper() and line.startswith('$TTL'):
            parts = line.split()
            if len(parts) > 1:
                try:
                    current_ttl = int(parts[1])
                except ValueError:
                    pass
            continue

        # Clean inline comments
        if ';' in line:
            line = line.split(';')[0].strip()
        if not line:
            continue

        parts = line.split()
        if len(parts) < 3:
            continue

        # Detect fields
        # Possible formats:
        # [name] [ttl] [class] type data...
        # [name] [class] type data...
        # [name] type data...
        idx = 0
        rec_name = parts[idx]
        idx += 1

        if rec_name == '@':
            full_name = origin.rstrip('.')
        elif rec_name.endswith('.'):
            full_name = rec_name.rstrip('.')
        else:
            full_name = f"{rec_name}.{origin.rstrip('.')}"

        ttl = current_ttl
        # Check if next token is numeric TTL
        if idx < len(parts) and parts[idx].isdigit():
            ttl = int(parts[idx])
            idx += 1

        # Check if next token is class IN/CH/HS
        if idx < len(parts) and parts[idx].upper() in ['IN', 'CH', 'HS']:
            idx += 1

        if idx >= len(parts):
            continue

        rec_type = parts[idx].upper()
        idx += 1

        rec_data = " ".join(parts[idx:])

        if rec_type in ['A', 'AAAA', 'CNAME', 'TXT', 'MX', 'NS', 'PTR', 'SRV', 'CAA']:
            # Group records by (name, type) if needed or list them individually
            records.append({
                "name": full_name,
                "type": rec_type,
                "ttl": ttl,
                "value": rec_data
            })

    # Group record values by (name, type, ttl)
    grouped = {}
    for r in records:
        key = (r["name"], r["type"], r["ttl"])
        if key not in grouped:
            grouped[key] = []
        grouped[key].append(r["value"])

    result = []
    for (name, rec_type, ttl), vals in grouped.items():
        result.append({
            "name": name,
            "type": rec_type,
            "ttl": ttl,
            "records": vals,
            "routing_policy": "Simple"
        })

    return result


def export_bind_zone(zone_name: str, records: List[Any]) -> str:
    """
    Exports hosted zone records to BIND zone file format.
    """
    lines = [
        f"; BIND zone file for {zone_name}",
        f"; Exported from AWS Route53 Clone",
        f"$ORIGIN {zone_name.rstrip('.')}.",
        f"$TTL 300",
        ""
    ]

    for rec in records:
        name = rec.name
        rel_name = "@" if name == zone_name or name == f"{zone_name}." else name
        ttl = rec.ttl
        rec_type = rec.type
        
        # rec.records is stored as newline-separated or JSON list string
        import json
        try:
            val_list = json.loads(rec.records)
        except Exception:
            val_list = [v.strip() for v in rec.records.split("\n") if v.strip()]

        for val in val_list:
            lines.append(f"{rel_name:<20} {ttl:<6} IN {rec_type:<6} {val}")

    return "\n".join(lines)
