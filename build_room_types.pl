#!/usr/bin/env perl

use 5.14.2;
use warnings;

use Data::Dumper;
use JSON::XS;

my ($input_filename, $output_filename) = @ARGV;

die "usage: $0 <input_file> <output_file>" unless ( $input_filename and $output_filename );
die "can't read intput file $input_filename" unless -r $input_filename;

my @room_types = split /\R/ => do { 
    local $/; 
    IO::File->new($input_filename)->getline;
};

my $json = encode_json(\@room_types);
my $declaration = sprintf "var paranoia_room_types = %s;", $json;
say $declaration;
IO::File->new($output_filename => 'w')->print($declaration);
