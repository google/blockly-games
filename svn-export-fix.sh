if [ $# -ne 5 ] && [ $# -ne 4 ]; then
  echo "Usage: `basename $0` <github_user> <github_repo> <branch> <dest_dir> [<repo_dir>]"
  echo
  echo "if <repo_dir> is omitted then the entire repo archive is unpacked into <dest_dir>"
  exit 0
fi

DEST_DIR=./$4
SOURCE_URL=https://github.com/$1/$2/archive/refs/heads/$3.tar.gz
if [ $# -ne 5 ]; then
  SOURCE_DIR=$2-$3
else
  SOURCE_DIR=$2-$3/$5
fi

# fetches the headers (-I) while following redirects (-L) in fail mode (-f)
# in this case the cURL command fails if redirects do not result in HTTP 200
# while the GNU regex pattern command ensures that an archive is encountered
# together they ensure that there is a .tar-gz archive at the source URL
curl -sILf $SOURCE_URL | grep "^content-type: \+application/x-gzip" 1>/dev/null

if [ $? -ne 0 ]; then
  echo "GitHub repo '$1/$2' does not exist or does not have the '$3' branch"
  exit 1
fi

if [ -d $DEST_DIR ]; then rm -rf $DEST_DIR; fi
mkdir -p $DEST_DIR/.temp

curl -sL $SOURCE_URL | tar -xf - --directory=$DEST_DIR/.temp $SOURCE_DIR

if [ ! -d $DEST_DIR/.temp/$SOURCE_DIR ]; then
  echo "Unfamiliar archive content structure encountered on GitHub repo '$1/$2' (branch $3)"
  rm -rf $DEST_DIR/.temp 2>/dev/null
  exit 2
fi

mv $DEST_DIR/.temp/$SOURCE_DIR/* $DEST_DIR
rm -rf $DEST_DIR/.temp